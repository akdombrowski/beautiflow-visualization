import Form from "react-bootstrap/Form";

export function HomeFileImportForm(props) {
  return (
    <Form>
      <Form.Group controlId="formFileLg" className="mb-3">
        <Form.Label>Large file input example</Form.Label>
        <Form.Control type="file" size="lg" />
      </Form.Group>
    </Form>
  );
}

export default HomeFileImportForm;
