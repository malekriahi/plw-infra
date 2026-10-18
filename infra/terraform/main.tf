terraform {
  required_version = ">= 1.0.0"
}

variable "vmws_password" {
  description = "VMware REST API password"
  sensitive   = true
}

variable "base_vm_id" {
  description = "ID of ubuntu-base VM"
  type        = string
}

variable "vmrest_url" {
  description = "VMware REST API URL"
  default     = "http://172.20.208.1:8697"
}

locals {
  vms = {
    "control-plane" = { memory = 4096, processors = 2, ip = "192.168.32.10" }
    "worker-01"     = { memory = 3072, processors = 2, ip = "192.168.32.12" }
    "worker-02"     = { memory = 3072, processors = 2, ip = "192.168.32.13" }
    "infra"         = { memory = 4096, processors = 2, ip = "192.168.32.11" }
  }
}

resource "null_resource" "plw_vms" {
  for_each = local.vms

  triggers = {
    vm_name    = each.key
    static_ip  = each.value.ip
    base_vm_id = var.base_vm_id
  }

  provisioner "local-exec" {
    command = "echo '✅ PLW VM registered: ${each.key} @ ${each.value.ip}'"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "echo '🗑 Removed: ${self.triggers.vm_name} from Terraform state'"
  }
}

output "vm_ips" {
  value = { for k, v in local.vms : k => v.ip }
}
