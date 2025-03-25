# Loxo Integration Guide for Webflow Websites

This guide will walk you through the process of integrating Loxo job postings with your Webflow website using Vercel-hosted scripts. This setup allows you to display job listings from Loxo directly on your Webflow website, including job details and application functionality.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding Loxo API Endpoints](#understanding-loxo-api-endpoints)
3. [Setting Up Vercel](#setting-up-vercel)
4. [Deploying Scripts to Vercel](#deploying-scripts-to-vercel)
5. [Integrating Scripts with Webflow](#integrating-scripts-with-webflow)
6. [Customization Options](#customization-options)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have:

- A Loxo account with access to the API
- Your Loxo agency slug and bearer token
- A Webflow website where you want to display jobs
- A GitHub account (for Vercel deployment)
- A Vercel account (free tier is sufficient)

## Understanding Loxo API Endpoints

Loxo provides several API endpoints that we'll be using:

1. **Jobs List**: `https://app.loxo.co/api/{agency_slug}/jobs`
   - Retrieves a list of all job postings for your agency
   
2. **Job Detail**: `https://app.loxo.co/api/{agency_slug}/jobs/{id}`
   - Retrieves detailed information about a specific job posting
   
3. **Apply to Job**: `https://app.loxo.co/api/{agency_slug}/jobs/{id}/apply`
   - Allows candidates to apply to a specific job posting

## Setting Up Vercel

1. **Create a Vercel Account**:
   - Go to [Vercel](https://vercel.com) and sign up for a free account, preferably using your GitHub account for easier integration.

2. **Create a New Repository**:
   - Create a new repository on GitHub to host your scripts.
   - Clone the repository to your local machine.

3. **Prepare Your Project Structure**:
   - Create a folder structure similar to the one in this repository.
   - Add the JavaScript files (`jobs.js`, `job-detail.js`, and `apply-job.js`) to the appropriate directories.

## Deploying Scripts to Vercel

1. **Prepare Your Scripts**:
   - Ensure your scripts are properly configured with your Loxo credentials.
   - Make sure to replace `{agency_slug}` with your actual agency slug.
   - Set up environment variables in Vercel for your bearer token (more secure than hardcoding).

2. **Deploy to Vercel**:
   - Push your code to GitHub.
   - Log in to Vercel and create a new project.
   - Connect your GitHub repository.
   - Configure the project:
     - Set the output directory if needed.
     - Add environment variables (LOXO_BEARER_TOKEN, LOXO_AGENCY_SLUG).
   - Deploy the project.

3. **Verify Deployment**:
   - Once deployed, Vercel will provide you with a URL for your project.
   - Test your endpoints to ensure they're working correctly:
     - `https://your-vercel-domain.vercel.app/js/jobs.js`
     - `https://your-vercel-domain.vercel.app/js/job-detail.js`
     - `https://your-vercel-domain.vercel.app/js/apply-job.js`

## Integrating Scripts with Webflow

1. **Create Pages in Webflow**:
   - Create a page for job listings.
   - Create a template page for job details.
   - Create a job application form page if needed.

2. **Add Script Tags**:
   - In Webflow, go to the page settings for your job listings page.
   - In the "Before </body> tag" section, add:
     ```html
     <script src="https://your-vercel-domain.vercel.app/js/jobs.js"></script>
     ```
   
   - For your job detail page, add:
     ```html
     <script src="https://your-vercel-domain.vercel.app/js/job-detail.js"></script>
     ```
   
   - For your job application page, add:
     ```html
     <script src="https://your-vercel-domain.vercel.app/js/apply-job.js"></script>
     ```

3. **Set Up HTML Structure**:
   - Add div elements with specific IDs that your scripts will target.
   - For the jobs list page, add:
     ```html
     <div id="jobs-container"></div>
     ```
   
   - For the job detail page, add:
     ```html
     <div id="job-detail-container"></div>
     ```
   
   - For the job application page, add:
     ```html
     <div id="job-application-form"></div>
     
