import React, { useState, useMemo, useEffect } from "react";
import { QuarantinedTest } from "../../../src/types";
import { vscode } from "../utilities/vscode";
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

  // Initialize state from localStorage or empty set
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('expandedNodes');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

  // Update localStorage when expandedNodes changes
  useEffect(() => {
    localStorage.setItem('expandedNodes', JSON.stringify([...expandedNodes]));
  }, [expandedNodes]);

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
        <div key={node.path} className={`ml-4 ${!node.isFile ? 'mb-1' : ''}`}>
          <div 
            className={`flex items-center cursor-pointer hover:bg-[#2a2d2e] py-[3px] px-1 rounded ${
              node.isFile ? 'text-[#cccccc]' : 'text-[#8a8a8a]'
            }`}
            onClick={node.isFile ? () => handleFileClick(node.path) : () => toggleExpand(node.path)}
          >
            {!node.isFile && (
              <span className="w-4 h-4 flex items-center justify-center mr-1">
                {isExpanded ? (
                  <FaChevronDown className="w-3 h-3" />
                ) : (
                  <FaChevronRight className="w-3 h-3" />
                )}
              </span>
            )}
            {node.isFile ? (
              <FaFile className="w-4 h-4 mr-2 text-[#519aba]" />
            ) : (
              <FaFolder className="w-4 h-4 mr-2 text-[#dcb67a]" />
            )}
            <span className="flex-grow text-sm">{node.name}</span>
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">
              {node.count}
            </span>
          </div>
          {!node.isFile && isExpanded && (
            <div className="ml-2">
              {node.children.map(child => renderTree(child))}
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="text-sm font-normal text-[#cccccc] bg-[#1e1e1e]">
      {tree.children.map(child => renderTree(child))}
    </div>
  );
};

export default FlakyTestList;