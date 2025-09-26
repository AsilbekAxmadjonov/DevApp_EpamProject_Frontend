import { Badge } from "react-bootstrap"

export default function NotFoundPage() {
  return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '1rem'}}>
      <Badge style={{fontSize: '5rem'}} bg="dark">404</Badge>
      <h1>Oops! Page Not Found</h1>
    </div>
  )
}