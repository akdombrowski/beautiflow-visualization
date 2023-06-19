import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const WarningModal = ({ show, handleClose, handleContinueAnyways }) => {
  return (
    <Modal centered className="" size="lg" show={show} onHide={handleClose}>
      <Modal.Header closeButton className="bg-dark">
        <Modal.Title className="text-warning">
          <h1>Ahh! The file contains multiple flows!</h1>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-light bg-dark px-5 py-4">
        <h5>The uploaded file contains multiple flows.</h5>
        <h6>
          Using this file is{" "}
          <b>
            <i>not</i>
          </b>{" "}
          recommended.
        </h6>
        <h6>What's going to happen if you do, you ask?</h6>
        <h6>
          Stuff.{" "}
          <b>
            <i>Serious</i>
          </b>{" "}
          stuff. Ok? Okay?!?!? Ok.
        </h6>
        <p className="p-0 m-0 text-wrap text-break">
          It'll try to find the parent flow and use that. If it can't figure out
          which one is the parent (*awkward*), then it'll default to the first
          flow in the file.
        </p>
        <p className="p-0 m-0 text-wrap text-break">
          Try downloading the flows separately (without including subflows) and
          work with each of them in turn.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-dark">
        <Container fluid>
          <Row xs={2} className="w-100 justify-content-between m-0">
            <Col>
              <div className="d-grid h-100 w-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleContinueAnyways}
                >
                  <Row className="h-100 w-100 m-0 justify-content-center">
                    <Col xs={12}>
                      <h4 className="p-0 m-0 text-wrap text-break text-center">
                        Continue Anyways
                      </h4>
                    </Col>
                    <Col xs={12}>
                      <p className="p-0 m-0 fs-10 fw-lighter text-wrap text-break text-center">
                        (are you seriously going to go through with this?)
                      </p>
                    </Col>
                  </Row>
                </Button>
              </div>
            </Col>
            <Col>
              <div className="d-grid h-100 w-100">
                <Button size="sm" variant="primary" onClick={handleClose}>
                  <Row className="h-100 w-100 m-0 justify-content-between">
                    <Col xs={12}>
                      <h4 className="p-0 m-0 text-wrap text-break text-center">
                        Import a different flow
                      </h4>
                    </Col>
                    <Col xs={12}>
                      <p className="p-0 m-0 fs-10 fw-lighter text-wrap text-break text-center">
                        (coward's way out)
                      </p>
                    </Col>
                  </Row>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Footer>
    </Modal>
  );
};

export default WarningModal;
