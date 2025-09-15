# 🧠 From Notebook to Pipeline: A Deep Learning Developer's Journey (Part 1)

Every machine learning project starts with a spark of an idea. Mine was simple: "Could I build a model to tell the difference between pizza, steak, and sushi?" Like many developers, I opened my go-to tool for exploration: a Jupyter Notebook. It felt like the perfect place to start, but I quickly discovered that a notebook is just a starting point. The real journey—the one filled with frustrating setbacks and "aha!" moments—was turning that experimental script into a reliable, reusable machine learning system.

### The First Big Question: Is My Model Actually Any Good?

After some initial coding, I had a simple classifier that seemed to work. But my process was a mess. I was manually changing hyperparameters in code cells, re-running the notebook, and scribbling results in a notepad. I was getting numbers, but I couldn't trust them. This led to the first major challenge: **how can I prove my model's performance in a scientific, repeatable way?**

This single question broke down into a series of smaller, interconnected problems.

**Problem #1: My experiments were chaotic and biased.**
My first attempt at a solution was to bring order to the chaos. I wrote a nested loop to systematically iterate through every combination of model (`EfficientNetB0`, `B2`, `B4`), dataset size, and training duration.

![A table showing the structured plan for all 8 experiments, varying model type, data size, and epochs.](posts_assets/experiments-table.png)
*Moving from random tweaks to a structured experiment plan like this was the first step toward building a reliable model.*

This was a huge step forward! But it created a new problem: I was drowning in a sea of `print()` statements. Comparing the results of run #3 with run #17 was a nightmare of scrolling and squinting.

```python
# The first step toward a real system: a structured experiment loop
for data_name, train_dataloader in train_dataloaders_dict.items():
    for epochs in num_epochs_list:
        for model_name in models_list:
            # ... train and evaluate ...
```

**Problem #2: I couldn't visualize the story of my training.**
I realized I didn't just need results; I needed a narrative. I needed to see the learning curves to understand *how* each model was behaving. This is where TensorBoard came in. But my first attempt was, again, a mess. All my logs were jumbled into one confusing timeline.

![A screenshot of the TensorBoard dashboard showing accuracy curves for multiple experiments.](posts_assets/tensorboard-accuracy-chart.png)
*TensorBoard made it easy to visually compare all eight experiments. The superiority of the `EffNetB2` model trained on 20% of the data (the top-performing line) became immediately obvious.*

The insight wasn't just to *use* TensorBoard, but to be deliberate about *how* I organized my logs. I wrote a small utility function to create a clean, timestamped directory structure for every single run, which made the above visualization possible.

```python
# This function was the key to unlocking readable, comparable logs
def create_writer(experiment_name, model_name, extra=None):
    timestamp = datetime.now().strftime("%Y-%m-%d")
    log_dir = Path("runs") / timestamp / experiment_name / model_name
    # ...
```

Finally, I could see the story. I had a dashboard that clearly showed which models were learning fastest and which were overfitting. The data was now pointing to `EfficientNetB2` as the most promising candidate.

### The Second Big Question: How Do I Squeeze Out More Performance?

My experiments were now reliable, but the best model's accuracy was still just "okay." I knew the answer was **Transfer Learning**, but I soon learned that knowing the name of a technique is very different from implementing it correctly.

![A diagram showing a large pre-trained model being adapted for a new, smaller task.](posts_assets/feature-extraction-diagram.png)
*The core concept of feature extraction: keep the pre-trained 'backbone' (the feature learner) and only train a new, small 'head' (the classifier) on our specific data.*

**Problem #3: My GPU was crying and my training was slow.**
My first attempt was naive. I loaded a pre-trained `EfficientNet`, swapped the final layer for my 3-class classifier, and hit "train." My GPU fan spun up like a jet engine, and the estimated training time was in hours, not minutes.

The "aha!" moment came after digging into how transfer learning truly works. I was trying to retrain the entire network. The solution was to **freeze the backbone**.

![A screenshot of the torchinfo summary showing a massive reduction in trainable parameters.](posts_assets/torchinfo-frozen-layers.png)
*The proof is in the numbers. After freezing the backbone, the number of trainable parameters dropped from over 4 million to just 3,843, dramatically speeding up training.*


```python
# The crucial insight: only train the tiny new part of the model
for param in model.features.parameters():
    param.requires_grad = False # Freeze the billions of learned parameters
```

By freezing the vast majority of the network, I was only training the tiny "head" I had added. The training time plummeted, and my GPU could finally breathe.

**Problem #4: A better model was performing worse. Why?**
With my training loop now fast and efficient, I hit another wall. My accuracy was inexplicably poor. I spent hours debugging my code before realizing the problem wasn't in my logic, but in my data.

The pre-trained `EfficientNet` model expects images to be a specific size, with specific normalization values. My manually crafted image transforms were close, but not perfect. It was like speaking the same language but with a slightly wrong accent—the model was getting confused. The fix, once found, was beautifully simple:

```python
# This one line fixed a mountain of hidden data-mismatch issues
weights = torchvision.models.EfficientNet_B0_Weights.DEFAULT
auto_transforms = weights.transforms()
```
Using the transforms that came packaged with the pre-trained weights ensured my data was perfectly preened for the model and the accuracy immediately jumped.

### The Final Step: From a Monolithic Script to a Modular System

I now had a reliable, high-performing pipeline. But it was all trapped inside a single, massive 500-line script. It worked, but it wasn't a piece of software; it was a monolith.

The final challenge of this phase was to perform the **Great Refactor**. I systematically broke the monolithic script apart, piece by piece, into a dedicated Python package called `food_vision`. Each file was given a single, clear responsibility:
-   `data_setup.py`: Does one thing: creates `DataLoaders`.
-   `model_builder.py`: Does one thing: builds `EfficientNet` models.
-   `engine.py`: Does one thing: runs the training and testing loops.
-   `utils.py`: Holds the helpers for saving models and creating TensorBoard writers.

This process was the bridge from being a data scientist to being an MLOps engineer. The result wasn't just a script that ran; it was a **system** that could be imported, tested, and extended.

The ML brain was finally complete. It was validated, packaged, and ready. But it was a brain trapped in a jar, only accessible via my terminal. It felt like a powerful engine with no car around it. The next, even bigger challenge was giving it a body—an interactive web interface that anyone could use.

My struggle with web frameworks, background processes, and user experience is a whole other story. **If you want to see how I built the UI for this model, you can follow along in [Part 2 of this series](posts/from-notebook-to-ui-the-web-deployment-journey-part-2.html)!**