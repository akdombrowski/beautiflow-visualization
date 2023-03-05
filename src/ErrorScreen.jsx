import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

export function ErrorScreen(props) {
  return (
    <Container fluid>
      <Col xs={12} id="spacerTop" className="p-5"></Col>
      <Row className="h-100 align-content-around">
        <Col xs={12} className="">
          <Row className="text-center justify-content-center">
            <Col xs={12} className="text-center">
              <h1 className="text-danger fw-bolder">
                Well, this could've gone better.
              </h1>
            </Col>
            <Col xs={12}>
              <p>Are you sure this flow doesn't include a subflow?</p>
            </Col>
            <Col>
              <p>
                If it does, try exporting from DV without the subflow and try it
                again.
              </p>
            </Col>
          </Row>
        </Col>
        <Col xs={12} id="spacerMid" className="p-5"></Col>
        <Col xs={12}>
          <Row className="justify-content-center">
            <Col xs="auto">
              <Button
                className="text-light"
                variant="primary"
                size="lg"
                style={{ backgroundColor: "var(--bs-danger)" }}
                onClick={(e) => props.clearErr(e)}
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

export default ErrorScreen;
