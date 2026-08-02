provider "vmworkstation" {
  endpoint = "http://172.20.208.1:8697/api"
  username = "admin"
  password = var.vmws_password
  https    = false
  debug    = "NONE"
}

locals {
  vms = {
    "control-plane" = { memory = 4096, processors = 2 }
    "worker-01"     = { memory = 3072, processors = 2 }
    "worker-02"     = { memory = 3072, processors = 2 }
    "infra"         = { memory = 4096, processors = 2 }
  }
}

resource "vmworkstation_virtual_machine" "nodes" {
  for_each     = local.vms
  denomination = each.key
  description  = "PLW lab: ${each.key}"
  sourceid     = var.base_vm_id
  path         = "C:\\Users\\Mega Pc\\Documents\\Virtual Machines"
  memory       = each.value.memory
  processors   = each.value.processors
  state        = "on"
}

output "vm_names" {
  value = [for vm in vmworkstation_virtual_machine.nodes : vm.denomination]
}
