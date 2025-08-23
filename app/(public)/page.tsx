import { redirect } from 'next/navigation'

export default function PublicRootRedirect() {
  redirect('/home') // or any clean path you want to expose
  return null
}