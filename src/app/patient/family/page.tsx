import { redirect } from 'next/navigation';

export default function FamilyPage() {
  redirect('/patient/profile?tab=family');
}
