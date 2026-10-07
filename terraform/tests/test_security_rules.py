import os
import re
import sys

try:
    import pytest
except ImportError:
    pytest = None

TERRAFORM_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def read_tf_file(filename):
    filepath = os.path.join(TERRAFORM_DIR, filename)
    assert os.path.exists(filepath), f"Terraform file not found: {filename}"
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def kms_key_reference():
    content = read_tf_file("kms_iam.tf")
    match = re.search(r'resource\s+"aws_kms_key"\s+"([^"]+)"', content)
    assert match is not None, "KMS key resource must exist"
    return f"aws_kms_key.{match.group(1)}"

# ==============================================================================
# SECURITY RULE S1 TESTS: Customer Names & Phones Physically Isolated
# ==============================================================================
def test_rule_s1_rds_not_publicly_accessible():
    """Rule S1: Asserts RDS database has publicly_accessible explicitly set to false."""
    content = read_tf_file("database.tf")
    match = re.search(r"publicly_accessible\s*=\s*(false)", content)
    assert match is not None, "Rule S1 Violation: RDS instance must have 'publicly_accessible = false'"
    assert match.group(1) == "false"

def test_rule_s1_database_subnets_have_no_internet_route():
    """Rule S1: Asserts private DB route table does NOT route 0.0.0.0/0 to IGW or NAT."""
    content = read_tf_file("network.tf")
    # Extract aws_route_table.private_db block
    db_rt_match = re.search(r'resource\s+"aws_route_table"\s+"private_db"\s+\{(.*?)\}', content, re.DOTALL)
    assert db_rt_match is not None, "Private DB route table must exist"
    db_rt_block = db_rt_match.group(1)
    
    assert "0.0.0.0/0" not in db_rt_block, (
        "Rule S1 Violation: private-db-rt must NOT contain any default route to 0.0.0.0/0"
    )

# ==============================================================================
# SECURITY RULE S2 TESTS: S3 Bucket Never Public & Read via CloudFront OAC
# ==============================================================================
def test_rule_s2_s3_block_all_public_access():
    """Rule S2: Asserts all 4 S3 Block Public Access flags are set to true."""
    content = read_tf_file("storage.tf")
    flags = [
        "block_public_acls",
        "block_public_policy",
        "ignore_public_acls",
        "restrict_public_buckets",
    ]
    for flag in flags:
        match = re.search(rf"{flag}\s*=\s*true", content)
        assert match is not None, f"Rule S2 Violation: {flag} must be set to true in S3 public access block"

def test_rule_s2_cloudfront_oac_configured():
    """Rule S2: Asserts CloudFront Origin Access Control is configured with SigV4."""
    content = read_tf_file("storage.tf")
    assert re.search(r'resource\s+"aws_cloudfront_origin_access_control"\s+"oac"', content) is not None
    assert re.search(r'signing_protocol\s*=\s*"sigv4"', content) is not None

# ==============================================================================
# SECURITY RULE S3 TESTS: Encryption with Customer Managed Key (CMK)
# ==============================================================================
def test_rule_s3_kms_cmk_rotation_enabled():
    """Rule S3: Asserts KMS Customer Managed Key has annual rotation enabled."""
    content = read_tf_file("kms_iam.tf")
    match = re.search(r"enable_key_rotation\s*=\s*(true)", content)
    assert match is not None, "Rule S3 Violation: KMS Customer Managed Key must have annual key rotation enabled"

def test_rule_s3_rds_encrypted_with_cmk():
    """Rule S3: Asserts RDS database storage encryption references the KMS CMK."""
    content = read_tf_file("database.tf")
    kms_key = re.escape(kms_key_reference())
    assert re.search(r"storage_encrypted\s*=\s*true", content) is not None
    assert re.search(rf"kms_key_id\s*=\s*{kms_key}\.arn", content) is not None

def test_rule_s3_s3_encrypted_with_cmk():
    """Rule S3: Asserts S3 bucket server-side encryption references the KMS CMK."""
    content = read_tf_file("storage.tf")
    kms_key = re.escape(kms_key_reference())
    assert re.search(rf"kms_master_key_id\s*=\s*{kms_key}\.arn", content) is not None

def test_rule_s3_sns_encrypted_with_cmk():
    """Rule S3: Asserts SNS topic is encrypted with the KMS CMK."""
    content = read_tf_file("monitoring.tf")
    kms_key = re.escape(kms_key_reference())
    assert re.search(rf"kms_master_key_id\s*=\s*{kms_key}\.id", content) is not None, (
        "Rule S3 Violation: SNS topic must be encrypted with the Customer Managed Key"
    )

# ==============================================================================
# SECURITY RULE S4 TESTS: Only Application Servers Connect to Database
# ==============================================================================
def test_rule_s4_db_security_group_ingress_strictly_app_sg():
    """Rule S4: Asserts DB SG ingress on 5432 accepts traffic ONLY from App SG ID."""
    content = read_tf_file("security.tf")
    db_sg_match = re.search(r'resource\s+"aws_security_group"\s+"db"\s+\{(.*?)\n\}', content, re.DOTALL)
    assert db_sg_match is not None, "Database security group must exist"
    db_sg_block = db_sg_match.group(1)

    assert re.search(r"from_port\s*=\s*5432", db_sg_block) is not None
    assert re.search(r"security_groups\s*=\s*\[aws_security_group\.app\.id\]", db_sg_block) is not None, (
        "Rule S4 Violation: DB SG must restrict port 5432 ingress strictly to aws_security_group.app.id"
    )
    assert "0.0.0.0/0" not in db_sg_block, "Rule S4 Violation: DB SG must NOT allow any public CIDRs"

# ==============================================================================
# APPLICATION PORT & HEALTH CHECK CONTRACT
# ==============================================================================
def test_app_target_health_and_security_ports_match():
    """Asserts ALB, app SG, health check, and launched app server use port 3000."""
    compute = read_tf_file("compute.tf")
    security = read_tf_file("security.tf")

    target_group_match = re.search(
        r'resource\s+"aws_lb_target_group"\s+"tg"\s+\{(.*?)^\}',
        compute,
        re.DOTALL | re.MULTILINE,
    )
    assert target_group_match is not None, "ALB target group must exist"
    target_group = target_group_match.group(1)
    assert re.search(r"port\s*=\s*3000", target_group) is not None
    assert re.search(r'path\s*=\s*"/api/v1/health"', target_group) is not None

    app_sg_match = re.search(
        r'resource\s+"aws_security_group"\s+"app"\s+\{(.*?)^\}',
        security,
        re.DOTALL | re.MULTILINE,
    )
    assert app_sg_match is not None, "Application security group must exist"
    app_sg = app_sg_match.group(1)
    assert re.search(r"from_port\s*=\s*3000", app_sg) is not None
    assert re.search(r"to_port\s*=\s*3000", app_sg) is not None
    assert re.search(r"(?m)^\s*PORT=3000\s*$", compute) is not None

# ==============================================================================
# HIGH AVAILABILITY & AUTO SCALING RULES (R1, R2, R5, R6)
# ==============================================================================
def test_rule_r2_scheduled_prewarming_exists():
    """Rule R2: Asserts ASG has scheduled action to pre-warm to 6 instances at 08:50 AM."""
    content = read_tf_file("compute.tf")
    assert re.search(r'resource\s+"aws_autoscaling_schedule"\s+"pre_warm_0850"', content) is not None
    assert re.search(r'recurrence\s*=\s*"50 8 \* \* \*"', content) is not None
    assert re.search(r"desired_capacity\s*=\s*6", content) is not None

def test_rule_r2_scale_down_schedule_exists():
    """Rule R2: Asserts ASG has a scale-down schedule after the rush period."""
    content = read_tf_file("compute.tf")
    assert re.search(r'resource\s+"aws_autoscaling_schedule"\s+"scale_down_\w+"', content) is not None, (
        "Rule R2: ASG must have a scale-down scheduled action after the pre-warm rush"
    )

def test_rule_r6_multi_az_database_and_compute():
    """Rule R6: Asserts RDS is Multi-AZ and ASG spans dual AZs with min_size >= 2."""
    db_content = read_tf_file("database.tf")
    assert re.search(r"multi_az\s*=\s*true", db_content) is not None, "Rule R6: RDS must have multi_az = true"

    compute_content = read_tf_file("compute.tf")
    assert re.search(r"min_size\s*=\s*2", compute_content) is not None, "Rule R6: ASG min_size must be at least 2"
    assert re.search(r"max_size\s*=\s*8", compute_content) is not None, "ASG max_size must allow surge to 8"

def test_rule_r5_unhealthy_hosts_triggers_sns_alert():
    """Rule R5: Asserts CloudWatch alarm on UnHealthyHostCount >= 1 alerts SNS topic."""
    content = read_tf_file("monitoring.tf")
    assert re.search(r'resource\s+"aws_cloudwatch_metric_alarm"\s+"site_failing"', content) is not None
    assert re.search(r'metric_name\s*=\s*"UnHealthyHostCount"', content) is not None
    assert re.search(r"threshold\s*=\s*1", content) is not None
    assert re.search(r"alarm_actions\s*=\s*\[aws_sns_topic\.urgent_alerts\.arn\]", content) is not None

def test_sale_rush_alarm_has_actions():
    """Asserts the sale rush CloudWatch alarm actually notifies SNS when triggered."""
    content = read_tf_file("monitoring.tf")
    # Find the sale_rush alarm block
    alarm_match = re.search(r'resource\s+"aws_cloudwatch_metric_alarm"\s+"sale_rush"\s+\{(.*?)\n\}', content, re.DOTALL)
    assert alarm_match is not None, "Sale rush alarm must exist"
    alarm_block = alarm_match.group(1)
    assert re.search(r"alarm_actions\s*=", alarm_block) is not None, (
        "Sale rush alarm must have alarm_actions configured to notify the SNS topic"
    )

def test_imdsv2_token_enforced():
    """Security Best Practice: Asserts IMDSv2 is enforced on Launch Template."""
    content = read_tf_file("compute.tf")
    assert re.search(r'http_tokens\s*=\s*"required"', content) is not None

# ==============================================================================
# PRODUCTION SAFETY TESTS
# ==============================================================================
def test_alb_deletion_protection_enabled():
    """Asserts ALB has deletion protection enabled for production."""
    content = read_tf_file("compute.tf")
    assert re.search(r"enable_deletion_protection\s*=\s*true", content) is not None, (
        "ALB must have deletion protection enabled in production"
    )

def test_rds_deletion_protection_enabled():
    """Asserts RDS has deletion protection enabled for production."""
    content = read_tf_file("database.tf")
    assert re.search(r"deletion_protection\s*=\s*true", content) is not None, (
        "RDS must have deletion protection enabled in production"
    )

def test_s3_force_destroy_disabled():
    """Asserts S3 bucket cannot be force-destroyed in production."""
    content = read_tf_file("storage.tf")
    match = re.search(r"force_destroy\s*=\s*(\w+)", content)
    assert match is not None, "S3 bucket must have force_destroy explicitly set"
    assert match.group(1) == "false", (
        "S3 bucket must have force_destroy = false in production"
    )

def test_s3_versioning_enabled():
    """Asserts S3 bucket has versioning enabled for accidental deletion recovery."""
    content = read_tf_file("storage.tf")
    assert re.search(r'resource\s+"aws_s3_bucket_versioning"', content) is not None, (
        "S3 bucket must have versioning enabled"
    )

def test_rds_storage_autoscaling_configured():
    """Asserts RDS has max_allocated_storage set to allow storage auto-scaling."""
    content = read_tf_file("database.tf")
    assert re.search(r"max_allocated_storage\s*=\s*\d+", content) is not None, (
        "RDS must have max_allocated_storage configured to prevent disk-full outages"
    )

def test_no_hardcoded_credentials_in_variables():
    """Asserts sensitive variables (db_username, db_password) have no default values."""
    content = read_tf_file("variables.tf")
    # Find each sensitive variable block and check it has no default
    for var_name in ["db_username", "db_password"]:
        var_match = re.search(
            rf'variable\s+"{var_name}"\s+\{{(.*?)\n\}}',
            content,
            re.DOTALL,
        )
        assert var_match is not None, f"Variable {var_name} must exist"
        var_block = var_match.group(1)
        assert re.search(r'default\s*=', var_block) is None, (
            f"Security Violation: variable '{var_name}' must NOT have a hardcoded default value"
        )


if __name__ == "__main__":
    tests = [v for k, v in list(globals().items()) if k.startswith("test_") and callable(v)]
    passed = 0
    failed = 0
    print("=" * 70)
    print("  RUNNING IAC SECURITY COMPLIANCE TESTS")
    print("=" * 70)
    for test in tests:
        try:
            test()
            print(f"  [PASS] {test.__name__}")
            passed += 1
        except Exception as e:
            print(f"  [FAIL] {test.__name__}: {e}")
            failed += 1
    print("=" * 70)
    print(f"  {passed} passed, {failed} failed out of {len(tests)} tests")
    print("=" * 70)
    if failed > 0:
        sys.exit(1)
