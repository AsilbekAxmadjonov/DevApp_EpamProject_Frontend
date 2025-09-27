import { Spinner } from "react-bootstrap";

export default function Loader() {
  return (
    <div className="min-h-screen d-flex justify-content-center align-items-center">
      <Spinner animation="border" variant="light" />
    </div>
  );
}
