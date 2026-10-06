# SNS Topic for Incident Alerts (R5: Email manager when site fails)
resource "aws_sns_topic" "incident_alerts" {
  name = "${var.project_name}-incident-alerts"

  tags = {
    Name = "${var.project_name}-incident-alerts"
  }
}

# Email Subscription to Operations Manager (Mr. Ratana)
resource "aws_sns_topic_subscription" "manager_email" {
  topic_arn = aws_sns_topic.incident_alerts.arn
  protocol  = "email"
  endpoint  = var.manager_email
}

# =========================================================================
# ALERT 1: SALE RUSH (Load rises as sale opens -> scale out capacity)
# =========================================================================
resource "aws_cloudwatch_metric_alarm" "sale_rush" {
  alarm_name          = "${var.project_name}-alarm-sale-rush"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RequestCountPerTarget"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 1200
  alarm_description   = "Triggers when flash sale opens and request load surges (R2)"

  dimensions = {
    TargetGroup  = aws_lb_target_group.app_tg.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_autoscaling_policy.target_tracking_requests.arn]
}

# =========================================================================
# ALERT 2: SITE FAILING (Any server fails health check -> email manager immediately)
# =========================================================================
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  alarm_name          = "${var.project_name}-alarm-unhealthy-hosts-site-failing"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "R5: Immediately alerts Mr. Ratana via email if any server stops answering health checks"

  dimensions = {
    TargetGroup  = aws_lb_target_group.app_tg.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.incident_alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "high_5xx_errors" {
  alarm_name          = "${var.project_name}-alarm-high-5xx-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "R5: Alerts operations manager if target servers emit 5xx errors"

  dimensions = {
    TargetGroup  = aws_lb_target_group.app_tg.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = [aws_sns_topic.incident_alerts.arn]
}
