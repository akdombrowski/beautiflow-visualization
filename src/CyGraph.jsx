import CytoscapeComponent from 'react-cytoscapejs';
import {forwardRef} from 'react';

// Export const CyGraph = forwardRef(({ elements }, cyRef) => {
// export const CyGraph = ({ elements, cyRef }) => {
export default function CyGraph({elements, cyRef}) {
	return (
  <CytoscapeComponent
  id='cy'
  elements={CytoscapeComponent.normalizeElements(elements)}
  layout={{name: 'preset'}}
  style={{
				width: '97.5vw',
				height: '70vh',
				border: '.1rem solid black',
			}}
			//  Cy={(cy) => setCyRef(cy)}
  cy={cy => {
				cyRef.current = cy;
			}}
  wheelSensitivity={0.1}
  zoom={4}
  stylesheet={[
				{
					selector: 'node',
					style: {
						'background-opacity': 0.75,
						// "background-blacken": -.1,
						shape(ele) {
							if (ele.data('nodeType') !== 'EVAL') {
								return 'rectangle';
							}
						},
						width(ele) {
							if (ele.data('nodeType') === 'CONNECTION') {
								return '75rem';
							}

							if (ele.data('nodeType') === 'ANNOTATION') {
								return ele.data('properties').width.value;
							}

							return '50rem';
						},
						height(ele) {
							if (ele.data('nodeType') === 'CONNECTION') {
								return '75rem';
							}

							if (ele.data('nodeType') === 'ANNOTATION') {
								const h = ele.data('properties').height?.value;
								return h ? 25 : 20;
							}

							return '50rem';
						},
						'background-color'(ele) {
							const props = ele.data('properties');
							const readBGColor = props ? props.backgroundColor : null;
							if (readBGColor) {
								return readBGColor.value.slice(0, 7);
							}

							if (ele.data('nodeType') === 'CONNECTION') {
								return '#ffffff';
							}

							if (ele.data('nodeType') === 'ANNOTATION') {
								return '#f2f3f4';
							}

							return 'orange';
						},
						label(ele) {
							if (ele.data('nodeType') === 'ANNOTATION') {
								return ele.data('nodeType').slice(0, 4);
							}

							return (
								ele.data('nodeType')?.slice(0, 4)
                  + ':\n'
                  + ele.id()
                  + '\n('
                  + ele.position('x')
                  + ','
                  + ele.position('y')
                  + ')'
							);
						},
						'font-size': '25rem',
						'text-wrap': 'wrap',
						'text-valign': 'bottom',
						'text-transform': 'lowercase',
						color: 'cyan',
					},
				},

				{
					selector: 'edge',
					style: {
						width: 8,
						color: 'cyan',
						opacity: 0.7,
						'font-size': '30rem',
						'text-justification': 'center',
						'text-margin-x': '-10rem',
						'text-margin-y': '25rem',
						'text-rotation': 'autorotate',
						label: ele =>
							ele.target().position('x') - ele.source().position('x'),
						'line-color': '#777',
						'target-arrow-color': '#000',
						'target-arrow-shape': 'triangle-backcurve',
						'curve-style': 'bezier',
						'source-endpoint': 'outside-to-line-or-label',
						'target-endpoint': 'outside-to-line-or-label',
						'source-distance-from-node': '10rem',
						'target-distance-from-node': '0rem',
						'arrow-scale': 2,
					},
				},
			]}
		 />
	);
}
// };
// });

// export default CyGraph;
