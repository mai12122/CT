# ==============================================================================
# VPC & NETWORKING MODULE: Dual-AZ Isolated Network Topology
# ==============================================================================

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "ct-live-vpc"
  }
}

# ------------------------------------------------------------------------------
# 1. Public Subnets (Tier 1 - DMZ: ALB and NAT Gateway)
# ------------------------------------------------------------------------------
resource "aws_subnet" "public_1a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1a"
    Tier = "Public"
  }
}

resource "aws_subnet" "public_1b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1b"
    Tier = "Public"
  }
}

# ------------------------------------------------------------------------------
# 2. Private App Subnets (Tier 2 - Compute Fleet)
# ------------------------------------------------------------------------------
resource "aws_subnet" "app_1a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.10.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name = "app-subnet-1a"
    Tier = "PrivateApp"
  }
}

resource "aws_subnet" "app_1b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.20.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = false

  tags = {
    Name = "app-subnet-1b"
    Tier = "PrivateApp"
  }
}

# ------------------------------------------------------------------------------
# 3. Private DB Subnets (Tier 3 - Data Isolation - Rule S1)
# ------------------------------------------------------------------------------
resource "aws_subnet" "db_1a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.30.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = false

  tags = {
    Name = "db-subnet-1a"
    Tier = "PrivateDB"
  }
}

resource "aws_subnet" "db_1b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.40.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = false

  tags = {
    Name = "db-subnet-1b"
    Tier = "PrivateDB"
  }
}

# ------------------------------------------------------------------------------
# Gateways
# ------------------------------------------------------------------------------
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "ct-live-igw"
  }
}

resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name = "ct-nat-eip"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1a.id

  tags = {
    Name = "ct-nat-gw"
  }

  depends_on = [aws_internet_gateway.igw]
}

# ------------------------------------------------------------------------------
# Route Tables & Associations
# ------------------------------------------------------------------------------
# Public Route Table (Routes 0.0.0.0/0 to IGW)
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table_association" "pub_1a" {
  subnet_id      = aws_subnet.public_1a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "pub_1b" {
  subnet_id      = aws_subnet.public_1b.id
  route_table_id = aws_route_table.public.id
}

# Private App Route Table (Routes outbound updates 0.0.0.0/0 to NAT Gateway)
resource "aws_route_table" "private_app" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "private-app-rt"
  }
}

resource "aws_route_table_association" "app_1a" {
  subnet_id      = aws_subnet.app_1a.id
  route_table_id = aws_route_table.private_app.id
}

resource "aws_route_table_association" "app_1b" {
  subnet_id      = aws_subnet.app_1b.id
  route_table_id = aws_route_table.private_app.id
}

# Private DB Route Table (Rule S1: Strictly Local Only - Zero Default Route)
resource "aws_route_table" "private_db" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "private-db-rt"
    Rule = "S1-ZeroInternetRouting"
  }
}

resource "aws_route_table_association" "db_1a" {
  subnet_id      = aws_subnet.db_1a.id
  route_table_id = aws_route_table.private_db.id
}

resource "aws_route_table_association" "db_1b" {
  subnet_id      = aws_subnet.db_1b.id
  route_table_id = aws_route_table.private_db.id
}
