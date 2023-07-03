---
published: false
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
duration_minutes: 120
tags: data, analytics, Microsoft Fabric, Power BI
baner_url: assets/banner.png
sessions_title:
  - Introduction ====> @DavidAbu
  - Pre-requisites ====> @Jcardif
  - Loading Data into Onelake ===> @Jcardif
  - Transforming Data using Fabric notebooks ===> @Jcardif
  - Data Visualization using Power BI  ====> @DavidAbu
  - Training a Machine Learning Model ====> @BethanyJep
  - Deployment of the Machine Learning Model ====> @BethanyJep
  - Resources ====> @BethanyJep
---

## Introduction
## Pre-requisites
## Loading Data into Onelake
## Transforming Data using Fabric notebooks
## Data Visualization using Power BI
## Training a Machine Learning Model
### What we will cover
This section covers training a deep learning model on the Serengeti dataset. The Serengeti dataset is a collection of wildlife images captured by camera traps in the Serengeti National Park in Tanzania. The goal of this project is to train a model that can accurately classify the different species of animals in the images.

### Prerequisites:
In this notebook you will need the following libraries:
- Torch and torchvision for deep learning using [pytorch](https://pytorch.org/)
- Pandas, numpy and matplotlib
- Pillow to load and read an image file.
- Scikit-learn

You can install all the necessary libraries using pip, for example: `pip install torch`

### Milestone 1: Load your dataset
The images are already loaded in the lakehouse. First we will try and visualize individual images then convert the images into a dataframe.

You can try visualizing a single image as follows:
```
from PIL import Image
img = Image.open("<image_link>")
img.show()
```

Next, we load our data from lakehouse into a data frame using spark, to do this, you can:
```
# Read all the annotation from the lakehouse
df = spark.sql("SELECT * FROM Serengeti_Lakehouse.Annotations WHERE Annotations.category_id > 1")
```

Once our data is loaded, we filter out seasons we would want loaded and map the categories to the dataframe:
```
# filter out the season, sequence ID, category_id snf image_id
df_train = df.select("season", "seq_id", "category_id", "location", "image_id", "datetime")

# remove image_id wiTH null and duplicates
df_train = df_train.filter(df_train.image_id.isNotNull()).dropDuplicates()

# convert df_train to pandas dataframe
df_train = df_train.toPandas()

# Load the Categories DataFrame into a pandas DataFrame
category_df = spark.sql("SELECT * FROM Serengeti_Lakehouse.Categories").toPandas()

# Map category IDs to category names using a vectorized approach
category_map = pd.Series(category_df.name.values, index=category_df.id)
df_train['label'] = category_map[df_train.category_id].values

# Drop the category_id column
df_train = df_train.drop('category_id', axis=1)
```

Lastly, we convert our file name to read the image URL as follows:
```
# Rename the image_id column to filename
df_train = df_train.rename(columns={'image_id': 'filename'})

# Append the .JPG extension to the filename column
df_train['filename'] = df_train.filename + '.JPG'

# reduce to first frame only for all sequences
df_train = df_train.sort_values('filename').groupby('seq_id').first().reset_index()

# Define a function to apply to the filename column
def get_ImageUrl(filename):
    return f"/lakehouse/default/Files/images/train/{filename}"

# Create a new column in the dataframe using the apply method
df_train['image_url'] = df_train['filename'].apply(get_ImageUrl)

df_train
```
### Milestone 2: Transform your data
#### Label encoding
First, we transform categorical data to numerical data using LabelEncoder. It assigns a unique integer to each category in the data, allowing machine learning algorithms to work with categorical data.

You can do this by:
```
from sklearn.preprocessing import LabelEncoder

# Create a LabelEncoder object
le = LabelEncoder()

# Fit the LabelEncoder to the label column in the df_train DataFrame
le.fit(df_train['label'])

# Transform the label column to numerical labels using the LabelEncoder
df_train['labels'] = le.transform(df_train['label'])

# Print the first 10 rows of the transformed DataFrame
print(df_train.head(10))
```

#### Transforming our dataset
To train our model, we only need the filename and lables, therefore we create a new dataset with the two columns:
`df_train = df_train[['filename', 'labels']]`

Next we customize or dataset, transforming our files to tensors with the size 224x224 pixels. This is done to both the train and test dataset as follows:
```
from torch.utils.data import Dataset
import os

df_train = df_train[['filename', 'labels']]

class CustomDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.data = df_train
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
            label = self.data.iloc[idx, 1]
            return image, label

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

train_set = CustomDataset("/lakehouse/default/Files/images/train/", transform=transform)
test_set = CustomDataset("/lakehouse/default/Files/images/test/", transform=transform)
```
Lastly, we load the training and testing datasets in batches using Dataloader as follows:
```
# Load the training and test data
train_loader = DataLoader(train_set, batch_size=100, shuffle=True, num_workers=2)
test_loader = DataLoader(test_set, batch_size=100, shuffle=False, num_workers=2)
```
The `batch_size` parameter specifies the number of samples in each batch, the `shuffle` parameter specifies whether to shuffle the data before each epoch, and the `num_workers` parameter specifies the number of subprocesses to use for data loading.

The purpose of using data loaders is to efficiently load and preprocess large datasets in batches, which can improve the training speed and performance of machine learning models.
### Milestone 3: Train your model
#### Setting up mlflow to track our experiments
`mlflow` is an open source platform for managing the end-to-end machine learning lifecycle. It provides tools for tracking experiments, packaging code into reproducible runs, and sharing and deploying models. 

```
# Using mlflow library to activate our ml experiment

import mlflow

mlflow.set_experiment("serengeti-exp")
```

In the code above, we use the `set_experiment` function from the `mlflow` library to set the active experiment to "serengeti-exp". This will allow us to track the results of our machine learning experiments and compare them across different runs. 

By using `mlflow`, we can easily log and track the parameters, metrics, and artifacts of our machine learning experiments, and visualize and compare the results using the Microsoft Fabric UI.
#### Loading DenseNet 201 model
We use a convolutional neural network (CNN) to classify the images in the Serengeti dataset. The CNN consists of several convolutional layers followed by max pooling layers and fully connected layers.

In our case, we are load a pre-trained DenseNet 201 model from the `torchvision` library and modifying its classifier layer to output 50 classes instead of the default 1000 classes. The DenseNet 201 model is a convolutional neural network (CNN) that has been pre-trained on the ImageNet dataset, which contains millions of images across 1000 classes. The model consists of several convolutional layers followed by dense layers and a softmax output layer.

Next, we modify the classifier layer of the pre-trained model by replacing it with a new `nn.Linear` layer that has 50 output features. This is done to adapt the pre-trained model to the specific classification task at hand, which is to classify images of wildlife in the Serengeti dataset into 50 different species.

Additionally we check if a GPU is available and moves the model to the GPU if it is available. This is done to accelerate the training process if a GPU is available.

After this code is executed, the `model` object will be a pre-trained DenseNet 201 model with a modified classifier layer that can be used to classify images of wildlife in the Serengeti dataset into 50 different species. The code is as follows:

```
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
```
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
```
# train the model
num_epochs = 1
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
### Milestone 3: Saving our model:
The `torch.save()` function is used to save the state dictionary of the model to the file. The state dictionary contains the learned parameters of the model, such as the weights and biases of the convolutional layers and the classifier layer. To save our model, we use the code as follows:

```
# define the file path to save the model
PATH = "<path>serengeti_model.pt"

# Save the model
torch.save(model.state_dict(), PATH)
```

Once the model is saved to the file, it can be loaded and used later for inference or further training.

> We can also use the `mlflow` library to log the trained PyTorch model to the MLflow tracking server and register it as a model version with the name "serengeti-pytorch".

The code for this is:
```
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

## Deployment of the Machine Learning Model
Once we have trained our model, the next step is to evaluate its performance. We load our PyTorch model from the MLflow tracking server using the `mlflow.pytorch.load_model()` function and evaluating it on the test dataset.

Once the evaluation is complete, the code prints the final test loss and accuracy.

```
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

Next, we test our model with a single image. We use the `PIL` library to load an image from a file, resizing it to a fixed size, converting it to a PyTorch tensor, passing it through our trained PyTorch model, and getting the output as follows:

```
from PIL import Image

# Load the image
image = Image.open("<image-link>")

# Resize the image to a fixed size
resize_transform = transforms.Resize((224, 224))
image = resize_transform(image)

# Convert the image to a PyTorch tensor
tensor_transform = transforms.ToTensor()
tensor = tensor_transform(image)

# Convert the image to a PyTorch tensor
tensor = torch.tensor(image)

# Add a batch dimension to the tensor
tensor = tensor.unsqueeze(0)

# Pass the tensor through the model to get the output
output = model(tensor)

output
```

## Resources