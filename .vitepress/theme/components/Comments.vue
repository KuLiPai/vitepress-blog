<template>
  <div id="gitalk-container"></div>
</template>

<script lang="ts" setup>
import "gitalk/dist/gitalk.css";
import Gitalk from "gitalk";
import { onContentUpdated } from "vitepress";

// Function to clear all child elements from the Gitalk container
function deleteChild(element: HTMLElement | null): void {
  if (!element) return;
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
}

// Initialize Gitalk when content is updated
onContentUpdated(() => {
  // Reset Gitalk container
  const element = document.querySelector("#gitalk-container") as HTMLElement;
  if (!element) return;
  deleteChild(element);

  // Generate a unique ID for the Gitalk Issue (max 50 characters)
  const gitalkId = location.pathname
    .replace(/[^a-zA-Z0-9]/g, "-") // Replace non-alphanumeric characters
    .substring(0, 50); // Ensure length < 50

  // Configure Gitalk
  const gitalk = new Gitalk({
    clientID: "Ov23liDFDYtH9RlQnuyL",
    clientSecret: "3289485acfb50cc023db365875e5e962d94566fe", // TODO: Reset this secret in GitHub!
    repo: "vitepress-blog",
    owner: "KuLiPai",
    admin: ["KuLiPai"],
    id: gitalkId, // Use cleaned-up pathname as unique Issue ID
    title: document.title, // Use page title for Issue
    labels: ["Gitalk"], // Add Gitalk label to Issues
    language: "zh-CN",
    distractionFreeMode: true, // Enable distraction-free mode
    createIssueManually: false, // Allow automatic Issue creation
  });

  // Render Gitalk comments
  gitalk.render("gitalk-container");
});
</script>

<style scoped>
/* Add custom styles for Gitalk container if needed */
#gitalk-container {
  margin-top: 20px;
}
</style>
