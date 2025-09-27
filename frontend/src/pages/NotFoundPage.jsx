import { Badge } from "react-bootstrap";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center flex-column gap-3 text-white">
      <Badge
        bg="light"
        text="dark"
        style={{ fontSize: "4rem" }}
        className="rounded-4"
      >
        404
      </Badge>
      <h1 className="fw-bold">Oops! Page Not Found</h1>
    </div>
  );
}
