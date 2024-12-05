// import { FC } from "react";
// import { QuarantinedTest } from "../../../src/types";
// import { vscode } from "../utilities/vscode";

// interface FlakyTestListProps {
//     flakyTests: QuarantinedTest[];
// }

// const FlakyTestList: FC<FlakyTestListProps> = ({ flakyTests }) => {

//     // Group flaky tests by file path

//     const groupedTests = flakyTests.reduce((acc, test) => {
//         if (!acc[test.path]) {
//             acc[test.path] = [];
//         }

//         acc[test.path].push(test);

//         return acc;
//     }, {} as Record<string, QuarantinedTest[]>);


//     const handleFileClick = (filePath : string) => {
//         // Send a message to the extension to open the file
//         vscode.postMessage({ command: 'openFile', filePath });
//     };
    
//     return (
//         <ul className="space-y-4">
//             {Object.entries(groupedTests).map(([filePath, tests]) => (
//                 <li key={filePath} className="border p-4 rounded-lg">
//                     <div className="flex justify-between items-center cursor-pointer" onClick={() => handleFileClick(filePath)}>
//                         <span className="font-semibold">{filePath}</span>
//                         <span className="bg-red-500 text-white px-2 py-1 rounded-full">{tests.length}</span>
//                     </div>
//                 </li>
//             )
//         )}
//         </ul>
//     );
// };

// export default FlakyTestList;

// import React, { useState, useMemo } from "react";
// import { QuarantinedTest } from "../../../src/types";
// import { vscode } from "../utilities/vscode";
// // import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from '@heroicons/react/solid';
// import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from "react-icons/fa6";


// interface TreeNode {
//   name: string;
//   path: string;
//   isFile: boolean;
//   count: number;
//   children: TreeNode[];
// }

// interface FlakyTestListProps {
//   flakyTests: QuarantinedTest[];
// }

// const FlakyTestList: React.FC<FlakyTestListProps> = ({ flakyTests }) => {
//   // Build the tree structure
//   const tree = useMemo(() => {
//     const root: TreeNode = { name: 'root', path: '', isFile: false, count: 0, children: [] };

//     flakyTests.forEach(test => {
//       const parts = test.path.split('/');
//       let currentNode = root;

//       parts.forEach((part, index) => {
//         const isFile = index === parts.length - 1;
//         const path = parts.slice(0, index + 1).join('/');
//         let node = currentNode.children.find(child => child.name === part);

//         if (!node) {
//           node = { name: part, path, isFile, count: isFile ? 1 : 0, children: [] };
//           currentNode.children.push(node);
//         } else if (isFile) {
//           node.count++;
//         }

//         if (!isFile) {
//           currentNode.count++;
//         }

//         currentNode = node;
//       });
//     });

//     return root;
//   }, [flakyTests]);

//   const renderTree = (node: TreeNode) => {
//     const [isExpanded, setIsExpanded] = useState(false);

//     const toggleExpand = () => setIsExpanded(!isExpanded);

//     const handleFileClick = (filePath: string) => {
//       vscode.postMessage({ command: 'openFile', filePath });
//     };

//     return (
//       <div key={node.path} className="ml-4">
//         <div 
//           className="flex items-center cursor-pointer hover:bg-gray-200 py-1"
//           onClick={node.isFile ? () => handleFileClick(node.path) : toggleExpand}
//         >
//           {!node.isFile && (
//             isExpanded ? <FaChevronDown className="w-4 h-4 mr-1" /> : <FaChevronRight className="w-4 h-4 mr-1" />
//           )}
//           {node.isFile ? <FaFile className="w-4 h-4 mr-2" /> : <FaFolder className="w-4 h-4 mr-2" />}
//           <span className="flex-grow">{node.name}</span>
//           <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{node.count}</span>
//         </div>
//         {!node.isFile && isExpanded && node.children.map(child => renderTree(child))}
//       </div>
//     );
//   };

//   return (
//     <div className="text-sm">
//       {tree.children.map(child => renderTree(child))}
//     </div>
//   );
// };

// export default FlakyTestList;


// import React, { useState, useMemo } from "react";
// import { QuarantinedTest } from "../../../src/types";
// import { vscode } from "../utilities/vscode";
// // import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from '@heroicons/react/solid';
// import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from "react-icons/fa6";

// interface TreeNode {
//   name: string;
//   path: string;
//   isFile: boolean;
//   count: number;
//   children: TreeNode[];
// }

// interface FlakyTestListProps {
//   flakyTests: QuarantinedTest[];
// }

// const FlakyTestList: React.FC<FlakyTestListProps> = ({ flakyTests }) => {
//   // Build the tree structure
//   const tree = useMemo(() => {
//     const root: TreeNode = { name: 'root', path: '', isFile: false, count: 0, children: [] };

//     flakyTests.forEach(test => {
//       const parts = test.path.split('/');
//       let currentNode = root;

//       parts.forEach((part, index) => {
//         const isFile = index === parts.length - 1;
//         const path = parts.slice(0, index + 1).join('/');
//         let node = currentNode.children.find(child => child.name === part);

//         if (!node) {
//           node = { name: part, path, isFile, count: isFile ? 1 : 0, children: [] };
//           currentNode.children.push(node);
//         } else if (isFile) {
//           node.count++;
//         }

//         if (!isFile) {
//           currentNode.count++;
//         }

//         currentNode = node;
//       });
//     });

//     return root;
//   }, [flakyTests]);

//   // Separate state for expanded nodes
//   const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

//   const toggleExpand = (path: string) => {
//     setExpandedNodes(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(path)) {
//         newSet.delete(path);
//       } else {
//         newSet.add(path);
//       }
//       return newSet;
//     });
//   };

//   const renderTree = (node: TreeNode) => {
//     const isExpanded = expandedNodes.has(node.path);

//     const handleFileClick = (filePath: string) => {
//         console.log("handle file click invoked");
//         vscode.postMessage({ command: 'openFile', filePath });
//     };

//     return (
//       <div key={node.path} className="ml-4">
//         <div 
//           className="flex items-center cursor-pointer hover:bg-gray-200 py-1"
//           onClick={node.isFile ? () => handleFileClick(node.path) : () => toggleExpand(node.path)}
//         >
//           {!node.isFile && (
//             isExpanded ? <FaChevronDown className="w-4 h-4 mr-1" /> : <FaChevronRight className="w-4 h-4 mr-1" />
//           )}
//           {node.isFile ? <FaFile className="w-4 h-4 mr-2" /> : <FaFolder className="w-4 h-4 mr-2" />}
//           <span className="flex-grow">{node.name}</span>
//           <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{node.count}</span>
//         </div>
//         {!node.isFile && isExpanded && node.children.map(child => renderTree(child))}
//       </div>
//     );
//   };

//   return (
//     <div className="text-sm">
//       {tree.children.map(child => renderTree(child))}
//     </div>
//   );
// };

// export default FlakyTestList;


import React, { useState, useMemo } from "react";
import { QuarantinedTest } from "../../../src/types";
import { vscode } from "../utilities/vscode";
// import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from '@heroicons/react/solid';
import { FaFolder, FaFile, FaChevronRight, FaChevronDown } from "react-icons/fa6";

interface TreeNode {
  name: string;
  path: string;
  isFile: boolean;
  count: number;
  children: TreeNode[];
}

interface FlakyTestListProps {
  flakyTests: QuarantinedTest[];
}

const FlakyTestList: React.FC<FlakyTestListProps> = ({ flakyTests }) => {
  // Build the tree structure
  const tree = useMemo(() => {
    const buildTree = (tests: QuarantinedTest[]): TreeNode => {
      const root: TreeNode = { name: 'root', path: '', isFile: false, count: 0, children: [] };

      tests.forEach(test => {
        const parts = test.path.split('/');
        let currentNode = root;

        parts.forEach((part, index) => {
          const isFile = index === parts.length - 1;
          const path = parts.slice(0, index + 1).join('/');
          let node = currentNode.children.find(child => child.name === part);

          if (!node) {
            node = { name: part, path, isFile, count: isFile ? 1 : 0, children: [] };
            currentNode.children.push(node);
          } else if (isFile) {
            node.count++;
          }

          if (!isFile) {
            node.count++;  // Increment count for folders
          }

          currentNode = node;
        });
      });

      // Helper function to recursively update folder counts
      const updateFolderCounts = (node: TreeNode): number => {
        if (node.isFile) {
          return node.count;
        }
        let totalCount = 0;
        for (const child of node.children) {
          totalCount += updateFolderCounts(child);
        }
        node.count = totalCount;
        return totalCount;
      };

      updateFolderCounts(root);
      return root;
    };

    return buildTree(flakyTests);
  }, [flakyTests]);

  // Separate state for expanded nodes
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderTree = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.path);

    const handleFileClick = (filePath: string) => {
        console.log("handle file click invoked");
        vscode.postMessage({ command: 'openFile', filePath });
    };

    return (
      <div key={node.path} className="ml-4">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-200 py-1"
          onClick={node.isFile ? () => handleFileClick(node.path) : () => toggleExpand(node.path)}
        >
          {!node.isFile && (
            isExpanded ? <FaChevronDown className="w-4 h-4 mr-1" /> : <FaChevronRight className="w-4 h-4 mr-1" />
          )}
          {node.isFile ? <FaFile className="w-4 h-4 mr-2" /> : <FaFolder className="w-4 h-4 mr-2" />}
          <span className="flex-grow">{node.name}</span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{node.count}</span>
        </div>
        {!node.isFile && isExpanded && node.children.map(child => renderTree(child))}
      </div>
    );
  };

  return (
    <div className="text-sm">
      {tree.children.map(child => renderTree(child))}
    </div>
  );
};

export default FlakyTestList;