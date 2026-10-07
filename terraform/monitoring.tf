# ==============================================================================
# MONITORING & ALERTING MODULE: CloudWatch Alarms & SNS Escalation
# Fulfills Rule R5 (Email manager when site failing) & Alert 1 (Rush scaling)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Urgent SNS Topic
# ------------------------------------------------------------------------------
resource "aws_sns_topic" "urgent_alerts" {
  name              = "ct-live-urgent-alerts"
  kms_master_key_id = aws_kms_key.bassac_cmk.id

  tags = {
    Name = "ct-live-urgent-alerts"
  }
}

resource "aws_sns_topic_subscription" "email_sub" {
  topic_arn = aws_sns_topic.urgent_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ------------------------------------------------------------------------------
# 2. CloudWatch Alarm 1: Sale Rush Surge Alarm (Alert 1)
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "sale_rush" {
  alarm_name          = "SaleRush-CapacityBoost"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RequestCountPerTarget"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 400
  alarm_description   = "Triggers when incoming HTTP request surge exceeds 400 requests/target"

  alarm_actions = [aws_sns_topic.urgent_alerts.arn]
  ok_actions    = [aws_sns_topic.urgent_alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.tg.arn_suffix
    LoadBalancer = aws_lb.alb.arn_suffix
  }

  tags = {
    Name = "SaleRush-CapacityBoost"
  }
}

# ------------------------------------------------------------------------------
# 3. CloudWatch Alarm 2: Site Outage Urgent Alarm (Alert 2 & Rule R5)
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "site_failing" {
  alarm_name          = "SiteFailing-UnhealthyHosts-Urgent"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "Rule R5: Urgent alert to Mr. Ratana when any backend host becomes unhealthy"

  alarm_actions = [aws_sns_topic.urgent_alerts.arn]
  ok_actions    = [aws_sns_topic.urgent_alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.tg.arn_suffix
    LoadBalancer = aws_lb.alb.arn_suffix
  }

  tags = {
    Name = "SiteFailing-UnhealthyHosts-Urgent"
    Rule = "R5-EmailManagerWhenSiteFailing"
  }
}
