import logo from "./logo.svg";
import "./App.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import {
  createCytoscapeGraphForViz,
  readFlowJSONFileWithFileReader,
  getCopyOfElementsObj,
  convertStrToJSON,
} from "./Cy";
import CytoscapeComponent from "react-cytoscapejs";

function App() {
  const [file, setFile] = useState("");
  const [flowJSON, setFlowJSON] = useState("");
  const [elements, setElements] = useState("");
  const cyContainerID = "cyContainer";
  const filename =
    "/home/adombrowski/workspace/beautiflowify/testFlows/WO_subflow_condensed_columns and rows - Beautiflow - Demo 3 - PingOne Sign-On, Password Forgot and Reset, User Registration_Export_2023-02-19T14_27_48.361Z.json";

  const previewFile = async (e) => {
    // const fileInput = document.querySelector("input[type=file]");
    // let fileRead;
    // if (fileInput) {
    //   [fileRead] = fileInput.files;
    // }
    // const reader = new FileReader();

    // reader.addEventListener(
    //   "load",
    //   () => {
    //     // this will then display a text file
    //     setFile(reader.result);
    //   },
    //   false
    // );

    // if (fileRead) {
    //   reader.readAsText(file);
    // }
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      console.log(text);
      setFlowJSON(text);
    };
    reader.readAsText(e.target.files[0]);
  };

  useEffect(() => {
    console.log("in useeffect");
    console.log(flowJSON);
    if (flowJSON) {
      const parsedJSONFlow = convertStrToJSON(flowJSON);
      setElements(getCopyOfElementsObj(parsedJSONFlow));
    }
  }, [flowJSON]);

  return (
    <Container fluid className="bg-dark">
      <Row>
        <Col xs={12} id="cyContainerCol" style={{ height: "80vh" }}>
          {elements ? (
            <CytoscapeComponent
              elements={CytoscapeComponent.normalizeElements(elements)}
              style={{ width: "100vw", height: "80vh" }}
            ></CytoscapeComponent>
          ) : (
            ""
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <input type="file" onChange={(e) => previewFile(e)} />
          <br />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button variant="dark">BFS</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
