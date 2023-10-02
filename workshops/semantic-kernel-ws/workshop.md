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


## Challenge 3 : build it from scratch

### Step 1 : define a semantic function and a native function

Semantic Kernel makes the difference between **semantic functions** and **native functions**. Semantic functions make use of a prompt to call a Large Language Model (LLM). Native functions don't need LLMs and can be written in C#.

The full power of Semantic Kernel comes from combining semantic and native functions.

#### step 1 goals

- Write a semantic function that generates an excuse email for your boss to avoid work and watch the next world cup rugby game. The function takes as input the day and time of the game, which you provide manually.
The function generates:
  - the body of the email
  - its topic
  - its recipient.

- Write a native function that calls a REST API (e.g. Bing search) to automatically retrieve the day and time of the next world cup rugby game.

#### step 1 useful concepts and syntax

Functions (both native and semantic) are grouped into plugins. In other words, a plugin is a collection of functions. Some plugins are already defined by the Semantic Kernel package. See the source code [here](https://github.com/microsoft/semantic-kernel/tree/main/dotnet/src/Plugins). You can use these plugins in your code with the following syntax:
```csharp
var timePlugin = new Timeskill(); // instantiate an out-of-the-box plugin
var daysAgo = time.DaysAgo; // instantiate a native function of this plugin
```

In the above snippet, Timeskill is the name of the plugin and DaysAgo is the name of one of its functions.

Other plugins are defined by developers. In the semantic kernel repository, you will find examples of such plugins [here](https://github.com/microsoft/semantic-kernel/tree/main/samples/plugins). If you want to use these plugins in your solution, you have to copy paste them into your codebase. You can also create your own plugins. The documentation explains how to [organise your plugins folder](https://learn.microsoft.com/en-us/semantic-kernel/ai-orchestration/plugins/native-functions/using-the-skfunction-decorator?tabs=Csharp#finding-a-home-for-your-native-functions). Note that within a plugin, each semantic function has its own folder whereas native functions are all defined in a single C# file.

To use a developer defined plugin, you can use the following syntax:
```csharp
var emailPlugin = kernel.ImportSemanticSkillFromDirectory("./Plugins", "Email");
var generateExcuse = emailPlugin["GenerateExcuse"];
```
In the above snippet, `Plugins` is the name of the folder containing all the developer defined plugins. `Email` is the name of the folder containing the email plugin. `GenerateExcuse` is the name of the folder that defines the semantic function that generates an excuse email. `GenerateExcuse` contains two files: `config.json` and `skprompt.txt`.

It is possible to parametrize semantic functions by adding a parameter in `config.json`:
```json
{
     "input": {
          "parameters": [
               {
                    "name": "myParameter",
                    "description": "",
                    "defaultValue": ""
               }
          ]
     }
}
```
and giving the parameter in `skprompt.txt`:
```txt
this prompt depends on the following parameter {{$myParameter}}.
```

The value of a parameter can be defined in the main program through context variables:
```csharp
var contextVariables = new ContextVariables
        {
            ["myParameter"] = "myValueForThisExecution",
        };
```

### Step 2 : orchestrate functions manually

#### step 2 goal

Integrate your semantic and native functions in order to generate your email excuse. For now we encourage you to do the integration by writing native code. In the next part, we will see how **planners** leverage LLMs to deal with the orchestration of functions. 

#### step 2 concepts and syntax

A semantic function must be called through a kernel:
```csharp
var result = await kernel.RunAsync(contextVariables, mySemanticFunction);
```

A kernel can be instantiated as follows:
```csharp
var builder = new KernelBuilder();
builder.WithAzureChatCompletionService(
        // Azure OpenAI Deployment Name,
        // Azure OpenAI Endpoint,
        // Azure OpenAI Key,
        );      
var kernel = builder.Build();
```

A native function can be called directly from the main program:
```csharp
var timePlugin = new Timeskill(); // instantiate an out-of-the-box plugin
var daysAgo = time.DaysAgo; // instantiate a native function of this plugin
var dateInAWeek = daysAgo(-7); // call a native function
```

### Step 3 : orchestrate functions with a planner

#### step 3 goal

Leverage a planner to orchestrate the previously written semantic and native functions: date retrieval, email generation.

#### step 3 concepts and syntax

Planners use LLMs to orchestrate the usage of semantic and native functions. At step 2, we integrated the email generation and API calls with native code. By using a planner, we can rely on an LLM to integrate semantic and native functions in order to achieve a goal. It's a declarative way of programming.

The planner is given the goal that the developper wants to achieve and the functions (semantic and native) that are available to him. The planner leverages the natural language understanding and generation capabilities of LLMs to propose a plan, i.e. a step by step usage of the available functions to achieve the goal. The proposed plan is then executed.

In Semantic Kernel, the 3 following planners are available:
  - Action Planner: chooses a single function in order to achieve the given goal.
  - Sequential Planner: chains several functions (semantic and native) to achieve the given goal.
  - Stepwise Planner: iteratively and adaptively produces a plan: the next step may depend on the result of the execution of the previous steps. 

For a planner to know which plugins it can use to generate a plan, plugins must be registered to a kernel.

Developer-defined plugins are registered with the syntax that we already used previously:
```csharp
var emailPlugin = kernel.ImportSemanticSkillFromDirectory("./Plugins", "Email");
var generateExcuse = emailPlugin["GenerateExcuse"];
```

For an out-of-the-box plugin, you can use the following syntax to register it to a kernel:
```csharp
kernel.ImportSkill(time);
```

To use the sequential planner, you can use the following syntax:
```csharp
var planner = new SequentialPlanner(kernel); // instantiate a planner
var plan = await planner.CreatePlanAsync("ask for the goal to achieve"); // create a plan
var result = await plan.InvokeAsync(); // execute the plan
```
Other planners (e.g. ActionPlanner and StepwisePlanner) follow a similar syntax.


### Step 4 : add nice-to-haves

Feel free to add any nice-to-have feature that you think makes sense.

#### step 4 goals

- Add memory : keep track of the previuosly sent excuses to make sure that you don't use the same excuse twice. See [Semantic Memory](https://github.com/microsoft/semantic-kernel/blob/main/dotnet/samples/KernelSyntaxExamples/Example14_SemanticMemory.cs) for a sample.

- Add telemetry : See [ApplicationInsights](https://github.com/microsoft/semantic-kernel/blob/main/dotnet/samples/ApplicationInsightsExample/Program.cs) for a sample.

- Add a nicer user interface.

- ...

### Validate the challenge

In order to validate the challenge, you should provide a manual orchestration and a planner orchestration of semantic and native functions.
