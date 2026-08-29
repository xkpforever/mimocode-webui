import { useParams } from 'react-router-dom'
import {
  ChatView,
} from '../components/chat/ChatView'

export function ChatPage() {
  const { sessionId } = useParams()

  return (
    <div className="flex-1 flex flex-col h-full">
      <ChatView sessionId={sessionId} />
    </div>
  )
}
