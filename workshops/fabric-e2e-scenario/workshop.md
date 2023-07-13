---
published: true
type: workshop
title: Hands-On Lab : Building an End-to-End data Analytics solution on Microsoft Fabric
short_title: Microsoft Fabric E2E
decsription: This workshop will walk you through the process of building an end-to-end data analytics solution on Microsoft Fabric. You will learn how to ingest data from multiple sources, transform the data, and build a dashboard on Power BI to visualize the data.
level: beginner
authors:
  - Josh Ndemenge
  - Bethany Jepchumba
  - David Abu
contacts:
  - '@Jcardif'
  - '@BethanyJep'
  - '@DavidAbu'
duration_minutes: 180
tags: data, analytics, Microsoft Fabric, Power BI
baner_url: assets/banner.png
sessions_title:
  - Introduction
  - Pre-requisites
  - Loading Data into Lakehouse
  - Exploring the SQL endpoint 
  - Data Visualization using Power BI
  - Transforming Data using Fabric notebooks
  - Training a Machine Learning Model
  - Resources
---

## Introduction

The data we'll be using in this workshop is the [Snapshot Serengeti dataset]((https://lila.science/datasets/snapshot-serengeti)). 

> **Citation:** *The data used in this project was obtained from the Snapshot Serengeti project.*

>Swanson AB, Kosmala M, Lintott CJ, Simpson RJ, Smith A, Packer C (2015) Snapshot Serengeti, high-frequency annotated camera trap images of 40 mammalian species in an African savanna. Scientific Data 2: 150026. DOI: https://doi.org/10.1038/sdata.2015.26

---

## Pre-requisites

---

## Loading Data into Lakehouse
In this section we'll load the data into the Lakehouse. The data is available in a public Blob Storage container. 

To begin, we will create and configure a new Lakehouse. To do this, in your workspace open the Data Engineering workload and create a new Lakehouse.

![Create Lakehouse](assets/create-lakehouse.png)

To load the data to the Lakehouse we will use the Data Factory pipelines, that will allow us to copy the data files into the Lakehouse. To do this: click on Get data and select New Data Pipeline. Provide a name then Create.

From the wizard that opens; choose Azure Blob Storage as your data source then click next.

![Create Data Pipeline](assets/select-data-source.png)

Create a new connection by providing the following URL:
```url
https://ssfabric.blob.core.windows.net/parquet-files
```
Provide an appropriate connection name, and for the Authentication kind select Anonymous and click next. 

![Create Data Pipeline](assets/create-connection.png)

If you get an error Unable to list files, provide the parent directory as follows ```parquet-files/``` then click on retry and this should fix the error. 

Click on the root folder and on the right panel under file format select ```Parquet``` then click Next.

![Create Data Pipeline](assets/select-source-container.png)

For the destination select ```Lakehouse``` and click next. In the drop down that appears select your Lakehouse then click next.

Select the Root folder to be Files, and under folder path, set this to a subdirectory called data. Leave the other files blank and click next.

![Create Data Pipeline](assets/select-root-destination.png)

For the last configuration step of your data destination, select the File format to be ```Parquet``` and leave the other fields as they are and click next. 

Finally review your configuration to copy data from the Blob Storage to your Lakehouse. Click Save + Run, to save and run your pipeline.

![Create Data Pipeline](assets/review-data-load.png)

This will take around 2 and a half minutes to execute after which you navigate back to the Lakehouse to explore and process the data. 

![Create Data Pipeline](assets/complete-copy.png)

From the Lakehouse explorer click on the ellipsis button on the Files Directory and click Refresh. Upon refreshing you’ll find the newly created subdirectory called data.

Clicking this subdirectory will reveal the 5 parquet files we copied from blob storage.

![Create Data Pipeline](assets/lakehouse-explorer.png)

Now that we already have the data files, we will need to load the data from these files into Delta tables. To do this right click on the individual parquet files and click ```Load to Tables``` and then ```Load```.  This will load the respective parquet file into a Delta table.

Note that you can only load the next file after the previous one has been loaded to Delta Tables.

After successful loading you can see the five tables in the Explorer.

![Create Data Pipeline](assets/load-to-tables.png)

Now that we have successfully loaded the data you click on the individual table to view the data. 

A description of the data contained in each table is as follows:

1. ```categories``` - This table contains the different categories of animal species in the dataset, with the ```id``` and ```name``` columns.

2. ```annotations``` - This table contains the annotations for each image in the dataset. The ```id``` column is the unique identifier for each annotation, the ```image_id``` column is the unique identifier for each image, the ```category_id``` column is the unique identifier for each category, the ```seq_id``` 

---

## Exploring the SQL endpoint

---


## Transforming Data using Fabric notebooks

---

## Data Visualization using Power BI

---

## Training a Machine Learning Model

---

### What we will cover
This section covers training a deep learning model on the Serengeti dataset. The Serengeti dataset is a collection of wildlife images captured by camera traps in the Serengeti National Park in Tanzania. The goal of this project is to train a model that can accurately classify the different species of animals in the images.

> [Notebook for training our model](assets/Serengeti%20train.ipynb)

### Prerequisites:
In this section you will need the following libraries:
- Torch and torchvision for deep learning using [pytorch](https://pytorch.org/)
- Pandas, numpy and matplotlib
- Pillow to load and read an image file.
- Scikit-learn: we use label encoder to convert labels into numerical value

You can install all the necessary libraries using pip, for example: `pip install torch`

### Milestone 1: Load your dataset
The images are already loaded in the lakehouse and a `parquet` file contains image details including season and labels. First we convert the parquet files to Delta tables. In machine learning, Delta tables can be used to store training data for machine learning models, allowing you to easily update the data and retrain the model.

![Converting parquet files to delta tables](assets/data_to_delta_tables.png)
To convert our data from parquet to delta files we:
* Go to Lakehouse
* Right click on our dataset, you will do this for both `sample_test.parquet` and `sample_train.parquet`
* Select **load to Tables** and **create a new table.**

Once our data is in delta files, we load our data and convert it to a Pandas dataframe:
```python
# load our data 
train_df = spark.sql("SELECT * FROM Serengeti_LH.sampled_train LIMIT 1000")

# convert train_df to pandas dataframe
train_df = train_df.toPandas()
```

Lastly, we convert our file name to read the image URL as follows:
```python
# Define a function to apply to the filename column
def get_ImageUrl(filename):
    return f"/lakehouse/default/Files/images/train/{filename}"

# Create a new column in the dataframe using the apply method
train_df['image_url'] = train_df['filename'].apply(get_ImageUrl)
```

Our output will be as follows:
![Our loaded data](assets/load_data.png)

### Milestone 2: Transform your data
#### **Label encoding**
First, we transform categorical data to numerical data using LabelEncoder. It assigns a unique integer to each category in the data, allowing machine learning algorithms to work with categorical data.

You can do this by:
```python
from sklearn.preprocessing import LabelEncoder

# Create a LabelEncoder object
le = LabelEncoder()

# Fit the LabelEncoder to the label column in the train_df DataFrame
le.fit(train_df['label'])

# Transform the label column to numerical labels using the LabelEncoder
train_df['labels'] = le.transform(train_df['label'])
```
> 📘 Our test dataset:
>
> Ensure you repeat the process for test dataset, drop the filename column and merge the two dataframes using `pd.concat()`

#### **Transforming our dataset**
To train our model, we customize our dataset, transforming our files to tensors with the size 224x224 pixels. This is done to both the train and test dataset as follows:
```python
from torch.utils.data import Dataset
import os
from PIL import Image

class CustomDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.data = data
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        while True:
            img_name = os.path.join(self.root_dir, self.data.iloc[idx, 0])
            if not os.path.exists(img_name):
                idx = (idx + 1) % len(self.data)
                continue
            image = Image.open(img_name)
            if self.transform:
                image = self.transform(image)
            labels = self.data.iloc[idx, 1]
            return image, labels

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

train_set = CustomDataset("/lakehouse/default/Files/images/train/", transform=transform)
test_set = CustomDataset("/lakehouse/default/Files/images/test/", transform=transform)
```
Lastly, we load the training and testing datasets in batches using Dataloader as follows:
```python
# Load the training and test data
train_loader = DataLoader(train_set, batch_size=100, shuffle=True, num_workers=2)
test_loader = DataLoader(test_set, batch_size=100, shuffle=False, num_workers=2)
```
The `batch_size` parameter specifies the number of samples in each batch, the `shuffle` parameter specifies whether to shuffle the data before each epoch, and the `num_workers` parameter specifies the number of subprocesses to use for data loading.

The purpose of using data loaders is to efficiently load and preprocess large datasets in batches, which can improve the training speed and performance of machine learning models.

### Milestone 3: Train your model
#### **Setting up mlflow to track our experiments**
`mlflow` is an open source platform for managing the end-to-end machine learning lifecycle. It provides tools for tracking experiments, packaging code into reproducible runs, and sharing and deploying models. 

```python
# Using mlflow library to activate our ml experiment

import mlflow

mlflow.set_experiment("serengeti-experimane")
```

![Setting up your mlflow experiment](assets/mlflow_exp.png)

In the code above, we use the `set_experiment` function from the `mlflow` library to set the active experiment to "serengeti-exp". This will allow us to track the results of our machine learning experiments and compare them across different runs. 

By using `mlflow`, we can easily log and track the parameters, metrics, and artifacts of our machine learning experiments, and visualize and compare the results using the Microsoft Fabric UI.

#### **Loading DenseNet 201 model**
We use a convolutional neural network (CNN) to classify the images in the Serengeti dataset. The CNN consists of several convolutional layers followed by max pooling layers and fully connected layers.

In our case, we are load a pre-trained DenseNet 201 model from the `torchvision` library and modifying its classifier layer to output 50 classes instead of the default 1000 classes. The DenseNet 201 model is a convolutional neural network (CNN) that has been pre-trained on the ImageNet dataset, which contains millions of images across 1000 classes. The model consists of several convolutional layers followed by dense layers and a softmax output layer.

Next, we modify the classifier layer of the pre-trained model by replacing it with a new `nn.Linear` layer that has 50 output features. This is done to adapt the pre-trained model to the specific classification task at hand, which is to classify images of wildlife in the Serengeti dataset into 50 different species.

Additionally we check if a GPU is available and moves the model to the GPU if it is available. This is done to accelerate the training process if a GPU is available.

After this code is executed, the `model` object will be a pre-trained DenseNet 201 model with a modified classifier layer that can be used to classify images of wildlife in the Serengeti dataset into 50 different species. The code is as follows:

```python
import torchvision

# load the pre-trained DenseNet 201 model
model = torchvision.models.densenet201(pretrained=True)
num_ftrs = model.classifier.in_features
model.classifier = nn.Linear(num_ftrs, 53)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
model = model.to(device)
```
### Loss Function
We use the cross-entropy loss function and the Adam optimizer to train the model. The code is as follows:
```python
# define the loss function
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)
```

The `nn.CrossEntropyLoss()` function is used to define the loss function. This loss function is commonly used for multi-class classification problems, such as the Serengeti dataset, where there are multiple classes to predict. The `nn.CrossEntropyLoss()` function combines the `nn.LogSoftmax()` and `nn.NLLLoss()` functions into a single function.

The `optim.Adam()` function is used to define the optimizer. The Adam optimizer is a popular optimization algorithm for training deep learning models. It is an adaptive learning rate optimization algorithm that is well-suited for large datasets and high-dimensional parameter spaces.

The `model.parameters()` function is used to specify the parameters that need to be optimized. In this case, it specifies all the parameters of the `model` object, which includes the weights and biases of the convolutional layers and the classifier layer.

The learning rate for the optimizer is set to 0.01 using the `lr` parameter. This is the step size at which the optimizer updates the model parameters during training.

#### Training our model
Using the DenseNet Model we just loaded, we go ahead and train our model as follows:
```python
# train the model
num_epochs = 5
for epoch in range(num_epochs):
    print('Epoch {}/{}'.format(epoch, num_epochs - 1))
    print('-' * 10)

    # Each epoch has a training and validation phase
    for phase in ["train", "val"]:
        if phase == "train":
            model.train()  # Set model to training mode
        else:
            model.eval()  # Set model to evaluate mode

        running_loss = 0.0
        running_corrects = 0
        for i, data in enumerate(train_loader, ):
            # get the inputs
            inputs, labels = data[0].to(device), data[1].to(device)
            inputs = inputs.to(device)
            labels = labels.to(device)

            # zero the parameter gradients
            optimizer.zero_grad()

            # forward
            # track history if only in train
            with torch.set_grad_enabled(phase == "train"):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                # backward + optimize only if in training phase
                if phase == "train":
                    loss.backward()
                    optimizer.step()

            # print statistics
            running_loss += loss.item()
            if i % 100 == 99:    # print every 100 mini-batches
                print('[%d, %5d] loss: %.3f' %
                    (epoch + 1, i + 1, running_loss / 100))
                running_loss = 0.0
        
    print('Finished Training')
```
Model training output:
![](assets/model_training.png)
### Milestone 3: Saving our model:
We can also use the `mlflow` library to log the trained PyTorch model to the MLflow tracking server and register it as a model version with the name "serengeti-pytorch". Once the model is saved, it can be loaded and used later for inference or further training.

The code for this is:
```python
# use an MLflow run and track the results within our machine learning experiment.

with mlflow.start_run() as run:
    print("log pytorch model:")
    mlflow.pytorch.log_model(
        model, "pytorch-model"
        registered_model_name="serengeti-pytorch"
    )
    
    model_uri = "runs:/{}/pytorch-model".format(run.info.run_id)
    print("Model saved in run %s" % run.info.run_id)
    print(f"Model URI: {model_uri}")
```

The results are as follows:
![Output of saving the mlflow model](assets/mlflow_model.png)

### Milestone 4: Evaluating our Machine Learning model
Once we have trained our model, the next step is to evaluate its performance. We load our PyTorch model from the MLflow tracking server using the `mlflow.pytorch.load_model()` function and evaluating it on the test dataset.

Once the evaluation is complete, the code prints the final test loss and accuracy.

```python
# load and evaluate the model
loaded_model = mlflow.pytorch.load_model(model_uri)
print(type(loaded_model))
correct_cnt, total_cnt, ave_loss = 0, 0, 0
for batch_idx, (x, target) in enumerate(test_loader):
    x, target = x, target
    out = loaded_model(x)
    loss = criterion(out, target)
    _, pred_label = torch.max(out.data, 1)
    total_cnt += x.data.size()[0]
    correct_cnt += (pred_label == target.data).sum()
    ave_loss = (ave_loss * batch_idx + loss.item()) / (batch_idx + 1)
    
    if (batch_idx + 1) % 100 == 0 or (batch_idx + 1) == len(test_loader):
        print(
            "==>>> epoch: {}, batch index: {}, test loss: {:.6f}, acc: {:.3f}".format(
                epoch, batch_idx + 1, ave_loss, correct_cnt * 1.0 / total_cnt
            )
        )

```
Model evaluation results:
![](assets/model_evaluation.png)
Next, we test our model with a single image. We use the `PIL` library to load an image from a file, resizing it to a fixed size, converting it to a PyTorch tensor, passing it through our trained PyTorch model, and getting the output as follows:

```python
# Resize the image to a fixed size
resize_transform = transforms.Resize((224, 224))
image = resize_transform(image)

# Convert the image to a PyTorch tensor
tensor_transform = transforms.ToTensor()
tensor = tensor_transform(image)

# Add a batch dimension to the tensor
tensor = tensor.unsqueeze(0)

# Load the model from MLflow
model = mlflow.pytorch.load_model(model_uri)

# Set the model to evaluation mode
model.eval()

# Pass the tensor through the model to get the output
with torch.no_grad():
    output = model(tensor)

# Get the predicted class
_, predicted = torch.max(output.data, 1)

print(predicted.item())
```

---

## Resources
- [Get Started with Microsoft Fabric](https://learn.microsoft.com/en-us/fabric/get-started/microsoft-fabric-overview?WT.mc_id=academic-77998-bethanycheum)
- [Explore lakehouses in Microsoft Fabric](https://learn.microsoft.com/en-us/training/modules/get-started-lakehouses/?WT.mc_id=academic-77998-bethanycheum)
- [Ingest Data with Dataflows Gen2 in Microsoft Fabric](https://learn.microsoft.com/en-us/training/modules/use-dataflow-gen-2-fabric/?WT.mc_id=academic-77998-bethanycheum)
- [Get Started with data science in Microsoft Fabric](https://learn.microsoft.com/en-us/training/modules/get-started-data-science-fabric/?WT.mc_id=academic-77998-bethanycheum)
- [Grow and Learn with the Microsoft Fabric Community](https://community.fabric.microsoft.com/?WT.mc_id=academic-77998-bethanycheum)

