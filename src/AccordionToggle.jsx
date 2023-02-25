import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import Card from "react-bootstrap/Card";

const CustomToggle = ({ children, eventKey, setAccordionCollapsedState }) => {
  const decoratedOnClick = useAccordionButton(eventKey, () => {
    setAccordionCollapsedState(eventKey);
  });

  return (
    <div className="d-grid h-100 w-100">
      <Button variant="secondary" style={{}} onClick={decoratedOnClick}>
        {children}
      </Button>
    </div>
  );
};

export default CustomToggle;
