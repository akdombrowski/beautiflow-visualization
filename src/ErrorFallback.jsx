import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Container fluid>
      <Row id="spacerTop" className="p-md-5 p-xs-1"></Row>

      <Row className="h-100 align-content-around justify-content-center">
        <Col xs={12} sm={10} md={8} className="pt-sm-1 pb-sm-5">
          <Card className="border border-danger bg-dark">
            <Card.Body className="p-sm-5 pt-sm-3 p-xs-1">
              <Card.Title className="text-danger fw-bolder text-center display-7 pb-sm-5 pb-xs-1">
                Well, this certainly could've gone better.
              </Card.Title>
              <Card.Text className="">{error.message}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
          <Row className="justify-content-center">
            <Col xs="auto">
              <Button
                className="text-light"
                variant="primary"
                size="lg"
                style={{ backgroundColor: "var(--bs-danger)" }}
                onClick={resetErrorBoundary}
              >
                Go back to the home screen.
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default ErrorFallback;
