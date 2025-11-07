import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <div className="header">
      <Link to="/" className="brand">
        <span>Olivia Hingley.</span>
      </Link>
      <div className="nav">
        <Link to="/about">About</Link>
      </div>
    </div>
  )
}
