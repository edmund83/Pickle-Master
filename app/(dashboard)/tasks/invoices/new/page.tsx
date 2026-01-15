import { getCustomers } from '@/app/actions/customers'
import { NewInvoiceClient } from './NewInvoiceClient'

export default async function NewInvoicePage() {
  const customers = await getCustomers()

  return <NewInvoiceClient customers={customers} />
}
