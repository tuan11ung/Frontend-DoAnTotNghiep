import type { Metadata } from 'next';
import { PublicLayout } from '@/src/shared/components/layout/PublicLayout';
import { MedicalChatScreen } from '@/src/features/medical-chat/MedicalChatScreen';

export const metadata: Metadata = {
  title: 'Chatbot y tế | MedConnect',
  description: 'Tra cứu tài liệu y tế và xem nguồn tham khảo.',
};

export default function ChatbotPage() {
  return <PublicLayout><MedicalChatScreen /></PublicLayout>;
}
