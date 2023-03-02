import cytoscape from "cytoscape";
// Import { readFileSync, writeFileSync } from "fs";

export const convertStrToJSON = (string_) => {
  try {
    return JSON.parse(string_);
  } catch (error) {
    throw new SyntaxError("Content needs to be of JSON", { cause: error });
  }
};

// Export const readFlowJSONFile = async (filename) => {
//   console.log("Reading flow json from file... ", filename);
//   if (!filename.endsWith(".json")) {
//     const errMsg = "Must use a JSON file (filename ends with .json).";
//     console.error(errMsg);
//     throw new Error(errMsg);
//   }

//   let data = await readFileSync(filename, "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//       throw new Error("Couldn't read file contents", { cause: err });
//     }

//     return data;
//   });

//   const flowJSON = convertStrToJSON(data);

//   return flowJSON;
// };

export const readFlowJSONFileWithFileReader = async (filename) => {
  console.log("Reading flow json from file...", filename);
  if (!filename.endsWith(".json")) {
    const errorMessage = "Must use a JSON file (filename ends with .json).";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const blob = new Blob([]);
  const reader = new FileReader();
  const data = new File(blob, filename, {
    type: "text/plain",
  });
  reader.addEventListener("load", (evt) => {
    const flowJSON = convertStrToJSON(text);
    return flowJSON;
  });

  const text = reader.readAsText(data);
};

export const getGraphData = (flowJSON) => {
  try {
    return flowJSON.graphData;
  } catch (error) {
    throw new Error("Could not extract graph data", { cause: error });
  }
};

export const createElementsObjFromArrays = (nodesArray, edgesArray) => ({
  nodes: nodesArray,
  edges: edgesArray,
});

export const getElements = (flowJSON) => {
  try {
    return getGraphData(flowJSON).elements;
  } catch (error) {
    throw new Error("Could not extract elements.", { cause: error });
  }
};

export const getNodes = (flowJSON) => {
  try {
    return getElements(flowJSON).nodes;
  } catch (error) {
    throw new Error("Could not extract nodes.", { cause: error });
  }
};

export const getEdges = (flowJSON) => {
  try {
    return getElements(flowJSON).edges;
  } catch (error) {
    throw new Error("Could not extract edges.", { cause: error });
  }
};

export const getCopyOfElementsObj = (flowJSON) => {
  try {
    const elementsCopy = JSON.parse(JSON.stringify(getElements(flowJSON)));
    return elementsCopy;
  } catch (error) {
    throw new Error("Could not get a copy of elements.", { cause: error });
  }
};

export const getCopyOfNodesArr = (flowJSON) => {
  try {
    return getNodes(flowJSON).slice(0);
  } catch (error) {
    throw new Error("Could not get nodes to make a copy.", { cause: error });
  }
};

export const getCopyOfEdgesArr = (flowJSON) => {
  try {
    return getEdges(flowJSON).slice(0);
  } catch (error) {
    throw new Error("Could not get edges to make a copy.", { cause: error });
  }
};

export const getCopyOfAnnotationsArr = (flowJSON) => {
  try {
    const nodes = getNodes(flowJSON);
    return Array.filter(
      nodes,
      (n, i, nodes) => n.data.nodeType === "ANNOTATION"
    );
  } catch (error) {
    throw new Error("Could not extract annotations.", { cause: error });
  }
};

export const getCopyOfNodesArrWOAnnotations = (flowJSON) => {
  try {
    const nodes = getNodes(flowJSON);
    return Array.filter(
      nodes,
      (n, i, nodes) => n.data.nodeType !== "ANNOTATION"
    );
  } catch (error) {
    throw new Error("Could not get a copy of nodes without annotations.", {
      cause: error,
    });
  }
};

export const getCopyOfNodesArrWOAnnotationsFromNodes = (nodes) => {
  try {
    const nodesCopy = nodes.clone();
    const nodesCopyWOAnnotations = nodesCopy.filter(
      '[nodeType != "ANNOTATION"]'
    );
    return nodesCopyWOAnnotations;
  } catch (error) {
    throw new Error("Could not get a copy of nodes without annotations.", {
      cause: error,
    });
  }
};

export const getCopyOfElementsObjWOAnnotations = (flowJSON) => {
  try {
    const nodesWOAnnotationsCopy = getCopyOfNodesArrWOAnnotations(flowJSON);
    const edgesCopy = getCopyOfEdgesArr(flowJSON);
    return createElementsObjFromArrays(nodesWOAnnotationsCopy, edgesCopy);
  } catch (error) {
    throw new Error("Could not get a copy of elements without annotations.", {
      cause: error,
    });
  }
};

export const convertToBasicCyNodesArr = (nodes) => {
  const cyNodes = [];

  for (const n of nodes) {
    const cyNode = {
      group: "nodes",
    };
    const data = {
      id: n.data.id,
    };
    const position = {
      x: n.position.x,
      y: n.position.y,
    };
    cyNode.data = data;
    cyNode.position = position;
    cyNodes.push(cyNode);
  }

  return cyNodes;
};

export const convertToBasicCyEdgesArr = (edges) => {
  const cyEdges = [];

  for (const e of edges) {
    const cyEdge = {
      group: "edges",
    };
    const data = {
      id: e.data.id,
      source: e.data.source,
      target: e.data.target,
    };
    cyEdge.data = data;
    cyEdges.push(cyEdge);
  }

  return cyEdges;
};

export const convertToBasicNodesAndEdgesAndCreateCytoscapeGraph = (
  flowJSON
) => {
  const nodesCopy = getCopyOfNodesArr(flowJSON);
  const edgesCopy = getCopyOfEdgesArr(flowJSON);
  const cyNodes = convertToBasicCyNodesArr(nodesCopy);
  const cyEdges = convertToBasicCyEdgesArr(edgesCopy);
  const elements = cyNodes.concat(cyEdges);
  const cy = cytoscape({
    elements,
    layout: "preset",
    headless: true,
    styleEnabled: false,
  });

  return cy;
};

export const createPosMapping = (flowJSON) => {
  const nodes = getCopyOfNodesArr(flowJSON);
  const posMapping = new Map();

  for (const n of nodes) {
    posMapping.set(n.data.id, { x: n.position.x, y: n.position.y });
  }

  return posMapping;
};

export const createCytoscapeGraph = (flowJSON) => {
  try {
    let parsedJSONFlow;
    try {
      parsedJSONFlow = convertStrToJSON(flowJSON);
    } catch {
      parsedJSONFlow = flowJSON;
    }

    const elementsCopy = getCopyOfElementsObj(parsedJSONFlow);

    const cy = cytoscape({
      elements: elementsCopy,
      layout: { name: "preset" },
      headless: true,
      styleEnabled: false,
    });

    return cy;
  } catch (error) {
    throw new Error("Could not create cytoscape graph.", { cause: error });
  }
};

export const createCytoscapeGraphForViz = (flowJSON, containerID) => {
  try {
    let parsedJSONFlow;
    try {
      parsedJSONFlow = convertStrToJSON(flowJSON);
    } catch {
      parsedJSONFlow = flowJSON;
    }

    const elementsCopy = getCopyOfElementsObj(parsedJSONFlow);
    const containerElement = document.getElementById(containerID);

    // Console.log(elementsCopy.jsons());

    const cy = cytoscape({
      container: containerElement,
      elements: elementsCopy,
      layout: { name: "preset" },
      headless: false,
      styleEnabled: true,
      style: [
        // The stylesheet for the graph
        {
          selector: "node",
          style: {
            "background-color": "#000",
            label: "data(id)",
          },
        },

        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });

    return cy;
  } catch (error) {
    throw new Error("Could not create cytoscape graph.", { cause: error });
  }
};

export const createCytoscapeGraphFromEles = async (elements) => {
  try {
    const cy = cytoscape({
      elements,
      // Positions: posMapping,
      // elements: () =>
      //   new Promise((resolve, reject) => {
      //     const elementsCopy = getCopyOfElementsObj(flowJSON);
      //     console.log("elementsCopy.nodes.length");
      //     console.log(elementsCopy.nodes.length);
      //     if (!elementsCopy || Object.values(elementsCopy).length === 0) {
      //       reject("No elements were found.");
      //     } else {
      //       resolve(elementsCopy);
      //     }
      //   }),
      layout: { name: "preset" },
      headless: true,
      styleEnabled: false,
    });

    return cy;
  } catch (error) {
    throw new Error("Could not create cytoscape graph.", { cause: error });
  }
};

export const removeAnnotationsFromCy = (cy) => {
  const cyWOAnnotations = cy.remove('[nodeType = "ANNOTATION"]');
  return cyWOAnnotations;
};

export const createCytoscapeGraphWOAnnotationsFromNodesEdgesArrays = (
  nodesArray,
  edgesArray
) => {
  try {
    return cytoscape({
      elements: () =>
        new Promise((resolve, reject) => {
          const elements = createElementsObjFromArrays(nodesArray, edgesArray);
          if (!elements || Object.values(elements).length === 0) {
            reject("No elements were found.");
          } else {
            resolve(elements);
          }
        }),
      layout: "preset",
      headless: true,
      styleEnabled: false,
    });
  } catch (error) {
    throw new Error("Could not create cytoscape graph.", { cause: error });
  }
};

export const createCytoscapeGraphWOAnnotations = (flowJSON) => {
  try {
    return cytoscape({
      elements: () =>
        new Promise((resolve, reject) => {
          const elementsCopy = getCopyOfElementsObjWOAnnotations(flowJSON);
          if (!elementsCopy || Object.values(elementsCopy).length === 0) {
            reject("No elements were found.");
          } else {
            resolve(getElements(flowJSON));
          }
        }),
      layout: "preset",
      headless: true,
      styleEnabled: false,
    });
  } catch (error) {
    throw new Error("Could not create cytoscape graph.", { cause: error });
  }
};

export const getMinXNode = (nodes) => {
  let minX = Number.POSITIVE_INFINITY;
  let minXNode;

  for (const n of nodes) {
    const x = n.position.x;
    if (x < minX) {
      minXNode = n;
      minX = x;
    }
  }

  return minXNode;
};

export const getMinYNode = (nodes) => {
  let minY = Number.POSITIVE_INFINITY;
  let minYNode;

  for (const n of nodes) {
    const y = n.position.y;
    if (y < minY) {
      minYNode = n;
      minY = y;
    }
  }

  return minYNode;
};

export const getMinXCyNode = (cyNodes) => {
  const minXCyNode = cyNodes.min((ele, i, eles) => ele.position("y")).ele;

  return minXCyNode;
};

export const getMinYCyNode = (cyNodes) => {
  const minYCyNode = cyNodes.min((ele, i, eles) => ele.position("y")).ele;

  return minYCyNode;
};

export const isEleYPosWithinToleranceOfY = (ele, y, tolerance) =>
  ele.position.y < y + tolerance && ele.position.y > y - tolerance;

export const getNodesWithinYTolerance = (cy, y, tolerance) =>
  cy.filter((ele, i, eles) => {
    if (!ele.isNode()) {
      return false;
    }

    if (ele.data.nodeType !== "CONNECTION") {
      return false;
    }

    if (
      ele.position.y > ele.position.y + tolerance ||
      ele.position.y < ele.position.y - tolerance
    ) {
      return false;
    }

    return true;
  });

export const shiftAnnosRenderedPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');
  // Can i run shift on a single node?
  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width.value;
    const newPosX = posX + width / 2;
    ele.renderedPosition("x", newPosX);
  });

  return nodes;
};

export const shiftAnnosPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');
  // Can i run shift on a single node?
  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width.value;
    const newPosX = posX + width / 2;
    ele.position("x", newPosX);
  });

  return nodes;
};

export const resetAnnosPosFromNodes = (nodes) => {
  const annies = nodes.filter('[nodeType = "ANNOTATION"]');
  // Can i run shift on a single node?
  annies.forEach((ele, i, eles) => {
    const posX = ele.position("x");
    const width = ele.data("properties").width.value;
    const newPosX = posX + width / 2;
    ele.position("x", -newPosX);
  });

  return nodes;
};

export const getCyNodesInRowAtYPos = (cyNodes, y, tolerance) =>
  cyNodes.filter((ele, i, eles) => {
    if (isEleYPosWithinToleranceOfY(ele.json(), y, tolerance)) {
      return true;
    }

    return false;
  });

export const getStartNode = (cyNodes, tolerance) => {
  const minY = cyNodes.min((ele, i, eles) => ele.position("y"));
  const minYPos = minY.value;
  const firstRowCyNodes = getCyNodesInRowAtYPos(cyNodes, minYPos, tolerance);
  const minX = Number.POSITIVE_INFINITY;
  const startCyNode = firstRowCyNodes.min((ele, i, eles) =>
    ele.position("x")
  ).ele;

  return startCyNode;
};

// Try out nodes.shift()
export const normalizeNodePositions = (nodes) => {
  const nodesCopy = nodes.slice(0);
  const minX = getMinXNode(nodesCopy).position.x;
  const minY = getMinYNode(nodesCopy).position.y;

  for (const n of nodesCopy) {
    n.position.x -= minX;
    n.position.y -= minY;
  }

  return nodesCopy;
};

export const normalizeCyNodePos = (nodes) => {
  const minX = getMinXCyNode(nodes.filter('[nodeType != "ANNOTATION"]'));
  const minXPos = minX.position("x");
  const minY = getMinYCyNode(nodes);
  const minYPos = minY.position("y");
  const xShift = -1 * minXPos;
  const yShift = -1 * minYPos;

  nodes.shift({ x: xShift, y: yShift });

  return nodes;
};

export const lockAnnotationPositions = (cy) => {
  cy.nodes('[nodeType = "ANNOTATION"]').lock();
};

export const spaceHorizontallyUsingCyGridLayout = (
  flowJSON,
  spacing,
  verticalTolerance
) => {
  const cy = createCytoscapeGraph(flowJSON);
  const options = {
    name: "grid",
    boundingBox: { x1: 0, y1: 0, w: 1920, h: 1080 },
    fit: false,
    padding: spacing,
    avoidOverlap: true,
    avoidOverlapPadding: spacing,
  };

  lockAnnotationPositions(cy);
  cy.layout(options).run();

  return cy;
};

export const sortNodes = (nodes, verticalTolerance) => {
  const nodesSorted = nodes.sort((ele1, ele2) => {
    const ele1X = ele1.position("x");
    const ele1Y = ele1.position("y");
    const ele2X = ele2.position("x");
    const ele2Y = ele2.position("y");
    const ele1NodeType = ele1.data.nodeType;
    const ele2NodeType = ele2.data.nodeType;

    if (ele1NodeType === "ANNOTATION") {
      return -1;
    }

    if (ele2NodeType === "ANNOTATION") {
      return 1;
    }

    if (ele1Y < ele2Y - verticalTolerance) {
      return -1;
    }

    if (ele2Y < ele1Y - verticalTolerance) {
      return 1;
    }

    if (ele2Y > ele1Y + verticalTolerance) {
      return -1;
    }

    if (ele1Y > ele2Y + verticalTolerance) {
      return 1;
    }

    if (ele1X < ele2X) {
      return -1;
    }

    return 1;
  });

  return nodesSorted;
};

export const sortRoots = (roots, verticalTolerance) => {
  const rootsSorted = roots.sort((ele1, ele2) => {
    const ele1X = ele1.position("x");
    const ele1Y = ele1.position("y");
    const ele2X = ele2.position("x");
    const ele2Y = ele2.position("y");

    if (ele1Y < ele2Y - verticalTolerance) {
      return -1;
    }

    if (ele2Y < ele1Y - verticalTolerance) {
      return 1;
    }

    if (ele2Y > ele1Y + verticalTolerance) {
      return -1;
    }

    if (ele1Y > ele2Y + verticalTolerance) {
      return 1;
    }

    if (ele1X < ele2X) {
      return -1;
    }

    return 1;
  });

  return rootsSorted;
};

export const getSourceNode = (cy, targetNodeID) => {
  const sourceNode = cy.$("#" + targetNodeID).incomers("node");
  return sourceNode;
};

// Export const calcNodeRows = (nodes) => {
//   const rows = [];
//   let rowNum = 0;

//   nodes.forEach((ele, i, eles) => {
//     // rootsArr1.forEach((ele, i, eles) => {
//     nodes.filter('[nodeType != "ANNOTATION"]').breadthFirstSearch({
//       root: ele,
//       visit: (v, edge, prev, j, depth) => {
//         if (!prev) {
//           currRowPosY += nextRowYAdd;
//           v.position({ x: rowStartPosX, y: currRowPosY });
//         } else {
//           const prevNodePosX = prev.position("x");
//           const prevNodePosY = prev.position("y");
//           const currNodePosY = v.position("y");
//           const nextPosX = prevNodePosX + spacing;

//           if (v.id() === testNode3ID) {
//             console.log();
//             console.log("currNode");
//             console.log(v.json());

//             console.log("prevNode");
//             console.log(prev.json());
//             console.log();
//           }
//           v.position("x", nextPosX);

//           // i think the diff calc is using the updated pos of the prev node, so it's not reliable
//           // calc row y pos ahead of time
//           if (currNodePosY - prevNodePosY > verticalTolerance) {
//             // 240 is where the next node should start accounting for space for an annotation above it with 150 spacing to that annotation from the row above
//             const nextPosY = prevNodePosY + 240;
//             const numberOfRowsBelow = Math.floor(
//               (currNodePosY - prevNodePosY) / verticalTolerance
//             );
//             v.position("y", nextPosY);
//           }
//         }
//       },
//       directed: true,
//     });
//   });
// };

export const animateSuccessorsOfEle = (ele, dur, color) => {
  const anis = ele
    .successors()
    .filter("node")
    .map((element, i, els) => {
      const ani = element.animation(
        {
          style: { backgroundColor: color },
        },
        {
          duration: dur,
          complete: () => console.log("animated " + ele.id() + "'s successors"),
        }
      );
    });

  return anis;
};

export const emitStyleEventForExplainerText = (
  cy,
  ani,
  aniDes,
  start,
  end,
  debugAnimations
) => {
  if (debugAnimations) {
    if (start) {
      console.log(ani, aniDes);
    } else if (end) {
      console.log(ani, aniDes, "completed");
    }
  }

  cy.emit("style", [ani, aniDes, start, end]);
};

export const animateNodesAndWait = async (cy, nodes, dur, color) =>
  Promise.all(
    nodes.map((ele, i, eles) => {
      const message = "animated " + ele.id();
      return new Promise((resolve, reject) => {
        const ani = ele.animation(
          {
            style: { backgroundColor: color },
          },
          {
            duration: dur,
            complete() {
              // Console.log("animated " + ele.id());
              emitStyleEventForExplainerText(cy, "", message, false, true);
              resolve(message);
            },
          }
        );
        emitStyleEventForExplainerText(cy, "", message, true, false);
        ani.play();
        // Await eles.pon("style");
      });
    })
  );

export const animateElesAndWait = async (cy, els, dur, color) =>
  Promise.all(
    els.map((ele, i, eles) => {
      const message = "animated " + ele.id();
      return new Promise((resolve, reject) => {
        let sty;
        sty = ele.isNode()
          ? { backgroundColor: color }
          : { "line-color": color };

        const ani = ele.animation(
          {
            style: sty,
          },
          {
            duration: dur,
            complete() {
              // Console.log("animated " + ele.id());
              emitStyleEventForExplainerText(cy, "", message, false, true);
              resolve(message);
            },
          }
        );
        emitStyleEventForExplainerText(cy, "", message, true, false);
        ani.play();
        // Await eles.pon("style");
      });
    })
  );

export const animateNodes = (nodes, dur, color) => {
  nodes.map((ele, i, eles) => {
    const ani = ele.animation(
      {
        style: { backgroundColor: color },
      },
      {
        duration: dur,
        complete() {
          // Console.log(ele.id() + " animated");
        },
      }
    );
    ani.play();
    // Await eles.pon("style");
  });
};

export const getAnimationPromiseForEle = (ele, dur, color) => {
  let ani;
  const prom = new Promise((resolve, reject) => {
    ani = ele.animation(
      {
        style: { backgroundColor: color },
      },
      {
        duration: dur,
        complete() {
          // Console.log(ele.id() + " animated");
          resolve("animated " + ele.id());
        },
      }
    );
  });
  return { ani, prom };
};

export const animateElePosAndPlay = (cy, ele, dur, color, pos) => {
  const message = "animated " + ele.id();
  return new Promise((resolve, reject) => {
    const ani = ele.animation(
      {
        position: pos,
        // Style: { backgroundColor: color },
      },
      {
        duration: dur,
        complete() {
          // Console.log(ele.id() + " animated");
          emitStyleEventForExplainerText(cy, "", message, false, true);
          resolve(message);
        },
      }
    );
    emitStyleEventForExplainerText(cy, "", message, true, false);
    ani.play();
  });
};

export const emitAndWaitForAni = async (message, id, cy, ani, aniProm) => {
  emitStyleEventForExplainerText(cy, "", message, true, false);
  ani.play();
  const animated = await aniProm;
  emitStyleEventForExplainerText(cy, "", message, false, true);
  return animated;
};

export const getRowOfNodesFromRoot = (root) => {
  const row = root.successors();
  return row.union(root);
};

export const doesNodePathMergeWithAlreadyVisitedNodes = (
  vSuccessors,
  v,
  spacing,
  visitedNodes
) => {
  const vSuccessorsPredecessors = vSuccessors.predecessors();
  // Get the already visited elements up to the point where v's path
  // hits an already visited node
  // this should give the eles which should be above the current node
  const visitedElesBeforePathMerge = vSuccessorsPredecessors.not(
    vSuccessors.union(v)
  );

  const removeUnvisitedNodes =
    visitedElesBeforePathMerge.intersection(visitedNodes);

  console.log("removeUnvisitedNodes");
  console.log(removeUnvisitedNodes.jsons());
  const { value, ele } = removeUnvisitedNodes.max((ele, i, eles) =>
    ele.position("y")
  );

  console.log("max y value");
  console.log(value);

  const posY = value + spacing;

  return posY;
};

export const beautiflowify = async (
  cy,
  spacing,
  verticalTolerance,
  dur,
  watchAnimation
) => {
  const cyBeforeRepositioning = await createCytoscapeGraphFromEles(
    cy.$("*").clone().jsons()
  );

  const nodes = cy.nodes();
  const nodesOG = nodes.clone();
  const nodesSorted = sortNodes(nodes, verticalTolerance);
  const normalizedNodes = normalizeCyNodePos(nodesSorted);
  const normalizedNodesUntouched = normalizedNodes.clone();
  const normalizedNodesWOAnnotations = normalizedNodes.filter(
    '[nodeType != "ANNOTATION"]'
  );
  const collWithNormalizedNodePos = cy.edges().union(normalizedNodes);
  cy.json(collWithNormalizedNodePos.jsons());

  const roots = normalizedNodesWOAnnotations.roots();
  const rootsSorted = sortRoots(roots, verticalTolerance);
  cy.fit(getRowOfNodesFromRoot(rootsSorted.first()), 150);

  // Just in case, lock annotations' pos
  lockAnnotationPositions(cy);

  const visitedNodes = cy.collection();
  const updatedPos = {};
  const rowStartPosX = 0;
  const firstRowStartPosY = 180;
  const sameRowDiffHeightSpacingY = 240;
  const sectionBaselinePosY = [];
  const rowSpacingY = 300;
  const highestYPosValueInSection = [];
  // For (const ele of roots) {
  for (let row = 0; row < rootsSorted.length; row++) {
    const ele = rootsSorted[row];
    const previousNodePos = {};
    const animations = [];
    const nodesInCurrRow = getRowOfNodesFromRoot(ele);
    const nodesInCurrRowClone = nodesInCurrRow.clone();
    const rootNodePosAdj = { x: 0, y: 0 };
    /**
     * SectionBasePosY is the y-value for the starting nodes and any following
     * nodes along that same horizontal line
     *
     * if row > 0,
     * take the lowest y value of the previous section and add our row spacing
     *  to it
     * else,
     * use the first row y pos (firstRowStartPosY)
     *
     * */
    sectionBaselinePosY[row] = row
      ? highestYPosValueInSection[row - 1] + rowSpacingY
      : firstRowStartPosY;
    // Init highest (lowest on screen visually) y-value for this new section to
    // be at this section's row height
    highestYPosValueInSection[row] = sectionBaselinePosY[row];

    /**
     * BFS
     *
     * runs @see {@link Cytoscape#breadthFirstSearch} on nodes in the same
     * section as the current iterated root node
     */
    nodesInCurrRow.breadthFirstSearch({
      root: ele,
      async visit(v, edge, previous, j, depth) {
        const currStepAnimations = {};
        const vPos = v.position();
        const vID = v.id();
        let previousNodeAniProm;
        let previousNodeAni;
        let currNodeAniProm;
        let currNodeAni;
        const pos = {};

        // Skip if we've already visited this node
        if (!visitedNodes.anySame(v)) {
          const vSuccessors = v.successors();

          /**
           * Current node color animation
           */
          currNodeAniProm = new Promise((resolve, reject) => {
            currNodeAni = v.animation(
              {
                style: { backgroundColor: "yellow" },
              },
              {
                duration: dur,
                complete: () => resolve("animated " + vID),
              }
            );
          });

          if (watchAnimation) {
            currStepAnimations.currID = vID;
            currStepAnimations.currAni = currNodeAni;
            currStepAnimations.currAniProm = currNodeAniProm;
          } else {
            currNodeAni.play();
          }
          /**
           *
           */

          /**
           * Decide new position based on whether if it's a root node or not
           *
           * Root nodes
           *  go to start of row's y pos, x pos should be 0
           *
           * Non-root nodes
           *  x pos will depend on how deep into bfs we are
           *  y pos depends on whether it's in a column with other nodes connected
           *    to the same source node
           */
          if (rootsSorted.getElementById(vID).length > 0) {
            // At a root node

            if (vSuccessors.anySame(visitedNodes)) {
              // This root contains a path that leads into nodes we've already
              // visited
              // Get the edges and sources coming into vSuccessors
              pos.y = doesNodePathMergeWithAlreadyVisitedNodes(
                vSuccessors,
                v,
                sameRowDiffHeightSpacingY,
                visitedNodes
              );

              const maxOfRow = vSuccessors.max((ele, i, eles) =>
                ele.position("y")
              );
              highestYPosValueInSection[row] = Math.max(pos.y, maxOfRow.value);
            } else {
              pos.y = sectionBaselinePosY[row];
            }

            highestYPosValueInSection[row] = Math.max(
              highestYPosValueInSection[row],
              pos.y
            );

            /**
             * Root node animation
             * color and position
             */
            let rootAni;
            pos.x = rowStartPosX;
            const rootAniProm = new Promise((resolve, reject) => {
              rootAni = v.animation(
                {
                  position: pos,
                  style: { backgroundColor: "white" },
                },
                {
                  duration: dur,
                  complete() {
                    // Console.log("animated " + vID)
                    resolve("animating root " + vID);
                  },
                }
              );
            });

            rootNodePosAdj.x = ele.position("x") - pos.x;
            rootNodePosAdj.y = ele.position("y") - pos.y;

            previousNodePos[vID] = pos;
            updatedPos[vID] = pos;

            if (watchAnimation) {
              currStepAnimations.rootID = vID;
              currStepAnimations.rootAniProm = rootAniProm;
              currStepAnimations.rootAni = rootAni;
              currStepAnimations.newRootPos = pos;
              animations.push(currStepAnimations);
            } else {
              rootAni.play();
            }
            /**
             *
             */
          } else if (previous) {
            const previousID = previous.id();
            const previousPosX = previous.position("x");
            const previousPosY = previous.position("y");
            const previousOG = cyBeforeRepositioning.getElementById(previousID);
            const previousOGPos = previousOG.position();
            const previousOGPosX = previousOGPos.x;
            const previousOGPosY = previousOGPos.y;
            const previousOutgoerNodes = previous.outgoers("node");
            // New x pos
            const posX = spacing * depth + rowStartPosX;
            // Object to store new position value

            previousNodeAniProm = new Promise((resolve, reject) => {
              previousNodeAni = previous.animation(
                {
                  style: { backgroundColor: "blue" },
                },
                {
                  duration: dur,
                  complete: () => resolve("animated " + previousID),
                }
              );
            });

            if (watchAnimation) {
              currStepAnimations.preID = previous?.id();
              currStepAnimations.preAniProm = previousNodeAniProm;
              currStepAnimations.preAni = previousNodeAni;
            } else {
              previousNodeAni.play();
            }
            /**
             *
             */

            /**
             *
             *
             * Calculate and move current node to new position
             *
             *
             */
            /**
             * New x position
             */
            pos.x = posX;
            /**
             *
             */

            /**
             * New y position
             *
             * Check if this node is in a stack by seeing if the previous
             * (source) node has more than 1 outgoer
             *
             * if it does, sort the previous node's outgoers by y value (from
             * lowest value to highest value)
             * then, the index of where the current node is found of that
             * sorted array of outgoers will be the level at which to place the
             * current node. with 0 being at the same baseline row height, and
             * higher values being successively visually lower rows
             *
             * if it doesn't, set new y pos value to be at the same y pos value
             * as its prev (source) node
             */
            if (previousOutgoerNodes.size() > 1) {
              const previousOutgoerNodesSorted = previousOutgoerNodes.sort(
                (ele1, ele2) => ele1.position("y") - ele2.position("y")
              );
              const previousOutgoerNodesSortedArray =
                previousOutgoerNodesSorted.toArray();
              for (const [
                j,
                element,
              ] of previousOutgoerNodesSortedArray.entries()) {
                const outgoerFromPreviousID = element.id();
                if (outgoerFromPreviousID === vID) {
                  // Get the updated position of the previous (source) node
                  const previousNewPos = previousNodePos[previousID];
                  const previousNewPosY = previousNewPos?.y;
                  // It should have a position object with a y value
                  if (!previousNewPosY && previousNewPosY !== 0) {
                    throw new Error(
                      "Missing y position value on the previous (source) node " +
                        previousID +
                        " in array:\n" +
                        JSON.stringify(previousNodePos)
                    );
                  }

                  // New y pos will be the previous node's y pos + what
                  // vertical level in the column stack this node is
                  // calculated by multiplying the current array index
                  // value with the row spacing for nodes in the same section
                  pos.y = previousNewPosY + j * sameRowDiffHeightSpacingY;
                }
              }
            } else {
              pos.y = previousNodePos[previousID].y;
            }
            /**
             *
             */

            highestYPosValueInSection[row] = Math.max(
              highestYPosValueInSection[row],
              pos.y
            );

            previousNodePos[vID] = pos;

            /**
             * Move animation
             */
            let vMoveAni;
            const vMoveAniProm = new Promise((resolve, reject) => {
              vMoveAni = v.animation(
                {
                  position: pos,
                  style: { backgroundColor: "purple" },
                },
                {
                  duration: dur,
                  complete() {
                    resolve(
                      "animating " +
                        vID +
                        "'s position to " +
                        JSON.stringify(pos)
                    );
                  },
                }
              );
            });

            if (watchAnimation) {
              // Add v's movement animation to current animations object
              currStepAnimations.vMovePos = pos;
              currStepAnimations.vMoveAniProm = vMoveAniProm;
              currStepAnimations.vMoveAni = vMoveAni;
              // Curr animations object to collective animations holder
              animations.push(currStepAnimations);
            } else {
              vMoveAni.play();
            }
            /**
             *
             */
            /**
             *
             *
             *
             *
             *
             */
          } else {
            // We should have a previous node because we didn't find the
            // current node in roots
            throw new Error(
              vID + " doesn't have a previous node and isn't a root node."
            );
          }

          /**
           * Remember that we've visited this node
           */
          visitedNodes.merge(v);
          /**
           *
           */
        }
      },
      directed: true,
    });

    /**
     * Play animations
     *
     * either one by one
     *  current setup with an await for each animation promise
     */
    // console.log("animating bfs");
    if (watchAnimation) {
      emitStyleEventForExplainerText(cy, "Beautiflowifying", "", true, false);

      for (const ani of animations) {
        const {
          preID,
          preAniProm,
          preAni,
          currID,
          currAni,
          currAniProm,
          rootID,
          rootAni,
          rootAniProm,
          newRootPos,
          vMovePos,
          vMoveAni,
          vMoveAniProm,
        } = ani;
        let message;

        // Need to figure out how to calculate for rows with multiple levels
        if (rootID) {
          let viewportAni;
          cy.fit(newRootPos, 50);

          const viewportAniProm = new Promise((resolve, reject) => {
            viewportAni = cy.animation({
              zoom: {
                level: 0.3,
                position: newRootPos,
              },
              duration: dur / 2,
              complete: () =>
                resolve("Adjusted viewport (panBy) to animating elements"),
            });
          });
          viewportAni.play();
          await viewportAniProm;
        }

        if (preAniProm && preAni) {
          message = "animating " + preID;
          const resolvedMessage = await emitAndWaitForAni(
            message,
            preID,
            cy,
            preAni,
            preAniProm
          );
        }

        message = "animating " + currID;
        const currAniResolvedMessage = await emitAndWaitForAni(
          message,
          currID,
          cy,
          currAni,
          currAniProm
        );

        if (vMovePos) {
          message =
            "animating " + ani.currID + " to " + JSON.stringify(vMovePos);
          const resolvedMessage = await emitAndWaitForAni(
            message,
            currID,
            cy,
            vMoveAni,
            vMoveAniProm
          );
        }

        if (rootAni) {
          message = "animating root " + rootID;
          const resolvedMessage = await emitAndWaitForAni(
            message,
            rootID,
            cy,
            rootAni,
            rootAniProm
          );
        }

        // Change prev node to green as its processing is complete
        if (preID) {
          message = "prev node " + preID + " processing is complete animation";
          const { ani: doneWithPreviousNodeAni, prom } =
            getAnimationPromiseForEle(cy.$("#" + preID), dur, "green");
          const resolvedMessage = await emitAndWaitForAni(
            message,
            preID,
            cy,
            doneWithPreviousNodeAni,
            prom
          );
        }

        if (
          !cy
            .$("#" + currID)
            .outgoers()
            .size()
        ) {
          message = "prev node " + preID + " processing is finished animation";
          const { ani: doneWithCurrLeafNodeAni, prom } =
            getAnimationPromiseForEle(cy.$("#" + currID), dur, "green");
          const resolvedMessage = await emitAndWaitForAni(
            message,
            preID,
            cy,
            doneWithCurrLeafNodeAni,
            prom
          );
        }
      }
    } else {
      cy.stop(false, true);
      cy.style()
        .selector('node[nodeType != "ANNOTATION"]')
        .style({ "background-color": "green" })
        .update();
    }

    emitStyleEventForExplainerText(cy, "Beautiflowifying", "", false, true);
    // Console.log("animating bfs completed");
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
  }

  const paddingPX = 25;
  cy.fit(cy.nodes('[nodeType != "ANNOTATION"]'), paddingPX);

  return cy;
};

/**
 * Has to be run on a cy instance *NOT* in headless mode
 *
 * @param {*} outputFilePath
 * @param {*} cy
 */
export const exportPNG = (outputFilePath, cy) => {
  const options = {
    output: "base64uri",
    full: true,
    maxWidth: 1920,
    maxHeight: 1080,
  };
};

export const getCyJSON = (cy) => {
  try {
    return cy.json(false);
  } catch (error) {
    throw new Error("Could not convert graph to json.", { cause: error });
  }
};

export const getDateTime = () => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const monthDateYear =
    month + 1 + "-" + date.getDate() + "-" + date.getFullYear();
  const hours24 = date.getHours();
  const meridiem = hours24 < 12 ? "am" : "pm";
  const h = hours24 % 12;
  const hours12 = h ? h : 12;
  const minutes = date.getMinutes();
  const m = minutes < 10 ? "0" + minutes : minutes;
  const seconds = date.getSeconds();
  const s = seconds < 10 ? "0" + seconds : seconds;
  const time = hours12 + "_" + m + "_" + s + "_" + meridiem;
  const dateTime = monthDateYear + "--" + time;

  return dateTime;
};

export const getFlowJSON = (ogFlowJSON, cy) => {
  const cyJSON = getCyJSON(cy);
  const dateTime = getDateTime();
  const name = "beautiflowified - " + dateTime;

  const copyOfFlowJSON = JSON.parse(JSON.stringify(ogFlowJSON));
  copyOfFlowJSON.name = copyOfFlowJSON.name
    ? name + " - " + copyOfFlowJSON.name
    : name;

  copyOfFlowJSON.graphData.elements.nodes = cyJSON.elements.nodes;
  copyOfFlowJSON.graphData.elements.edges = cyJSON.elements.edges;
  if (copyOfFlowJSON.enabledGraphData?.elements) {
    copyOfFlowJSON.enabledGraphData.elements.nodes = cyJSON.elements.nodes;
    copyOfFlowJSON.enabledGraphData.elements.edges = cyJSON.elements.edges;
  }

  copyOfFlowJSON.updatedDate = Date.now();

  return copyOfFlowJSON;
};

// Export const writeFlowJSON = (outputFilePath, ogFlowJSON, cy) => {
//   writeFileSync(outputFilePath, getFlowJSON(ogFlowJSON, cy));
// };
