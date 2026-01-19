import { getCustomers } from '@/app/actions/customers'
import { NewDeliveryOrderClient } from './NewDeliveryOrderClient'

export default async function NewDeliveryOrderPage() {
  const customers = await getCustomers()

  return <NewDeliveryOrderClient customers={customers} />
}
