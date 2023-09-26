---
published: false                        # Optional. Set to true to publish the workshop (default: false)
type: workshop                          # Required.
title: Semantic Kernel Workshop         # Required. Full title of the workshop
short_title: SKWS     # Optional. Short title displayed in the header
description: This is a workshop to discover Semantic Kernel through the usage and the discovery of different topics.  # Required.
level: advanced                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Maxime Villeger
contacts:                               # Required. Must match the number of authors
  - mavilleg@microsoft.com
duration_minutes: 1440                   # Required. Estimated duration in minutes
tags: C#, GenAI, OpenAI                  # Required. Tags for filtering and searching
#banner_url: assets/banner.jpg           # Optional. Should be a 1280x640px image
#video_url: https://youtube.com/link     # Optional. Link to a video of the workshop
#audience: students                      # Optional. Audience of the workshop (students, pro devs, etc.)
#wt_id: <cxa_tracking_id>                # Optional. Set advocacy tracking code for supported links
#oc_id: <marketing_tracking_id>          # Optional. Set marketing tracking code for supported links
#navigation_levels: 2                    # Optional. Number of levels displayed in the side menu (default: 2)
sections_title:                         # Optional. Override titles for each section to be displayed in the side bar
   - Semantic Kernel Workshop 
   
   - Introduction 

   - Challenge 1
---

# Semantic Kernel Workshop

This is an envisioning workshop, based on Microsoft's Copilot stack [Microsoft's Copilot stack](https://learn.microsoft.com/en-us/semantic-kernel/overview/#semantic-kernel-is-at-the-center-of-the-copilot-stack), to rethink user experience, architecture, and app development by leveraging the intelligence of foundation models. This workshop will use Semantic Kernel (SK), along with SK's Design thinking material, to guide you through the lifecycle of intelligent app development. 

---

## Introduction

Content for second section

---

## Challenge 1

content for 1

---

## Semantic Kernel Challenge : gain full control over your AI app

### Getting started

Follow [these instructions](https://github.com/microsoft/semantic-kernel/blob/main/dotnet/README.md) to (create a Semantic function)?

### Semantic and Native functions

Semantic Kernel makes the difference between Semantic functions and Native functions. Semantic functions make use of a prompt to call a Large Language Model (LLM). Native functions don't need LLMs and can be written in C#.

The full power of Semantic Kernel comes from combining Semantic and Native functions.

- Write a semantic function that generates an excuse email for your boss to avoid work and watch the next world cup rugby game. The function takes as input the day and time of the game, which you provide manually.
The function generates:
  - the body of the email
  - its topic
  - its recipient.

- Write a native function that sends the previously generated email to your boss (or use another recipient email address).

- Write a native function that calls a REST API (e.g. Bing search) to automatically retrieve the day and time of the next game.

- Integrate it to your email excuse tool. For now we encourage you to do the integration by writing native code. In the next part, we will see how Planners leverage LLMs to deal with the orchestration of functions. 

### Planner

Planners use LLMs to orchestrate the usage of Semantc and Native functions. Previously we integrated the email generation and API calls with native code. By using a planner, we can rely on an LLM to integrate Semantic and Native functions in order to achieve a goal.

The planner is given the goal that the developper wants to achieve and the functions (Semantic and Native) that are available to him. The planner leverages the natural language understanding and generation capabilities of LLMs to propose a plan, i.e. a step by step usage of the available functions to achieve the goal. The proposed plan is then executed.

In Semantic Kernel, 4 planners are available:
  - Plan Object Model : ? 
  - Action Planner: produces a full-fledged plan at once.
  - Sequential Planner: produces a full-fledged plan at once.
  - Stepwise Planner: iteratively and adaptively produces a plan: the next step may depend on the result of the execution of the previous steps. 

For many needs, the Action or Sequential Planners are sufficient. The Stepwise Planner offers more flexibility at the cost of more LLM calls.

- Leverage a planner to orchestrate the previously written Semantic and Native functions: date retrieval, email generation, email sending.

### Nice-to-haves

Feel free to add any nice-to-have feature that you think make sense. Below are a few examples:

- Add memory : keep track of the previuosly sent excuses to make sure that you don't use the same excuse twice. See [Semantic Memory](https://github.com/microsoft/semantic-kernel/blob/main/dotnet/samples/KernelSyntaxExamples/Example14_SemanticMemory.cs) for a sample.

- Add telemetry : See [ApplicationInsights](https://github.com/microsoft/semantic-kernel/blob/main/dotnet/samples/ApplicationInsightsExample/Program.cs) for a sample.

- Add a nicer user interface.

- ...

---
