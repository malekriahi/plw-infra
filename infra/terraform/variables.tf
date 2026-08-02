variable "vmws_password" {
  description = "VMware REST API password"
  sensitive   = true
}
variable "base_vm_id" {
  description = "ID of ubuntu-base VM from vmrest API"
  type        = string
}
