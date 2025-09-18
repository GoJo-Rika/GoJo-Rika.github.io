# The Engine Room: A Deep Dive into the ML Training & Evaluation Workflow

In the first part of this series, we laid the blueprint. We transformed a chaotic research notebook into a structured, production-ready MLOps pipeline. We separated our code from our configuration, built modular components, and created an orchestrated workflow ready for the real work. The foundation is solid. Now, it's time to build the engine.

This post is a deep dive into the heart of the project—the machine learning components that power our Text Summarizer. With our robust architecture in place, we can confidently execute each stage of the ML lifecycle, knowing the process is repeatable and reliable. Let's walk through the engine room, stage by stage.

## Stage 1 & 2: Sourcing and Shaping Our Fuel (Data Ingestion & Transformation)

Every machine learning model is fueled by data, and ours is no different. The pipeline kicks off with **Data Ingestion**, a straightforward component that downloads the [SAMSum dataset](https://huggingface.co/datasets/samsum) and unzips it into our `artifacts` directory.

But raw data is rarely in a format a model can understand. This is where the crucial **Data Transformation** stage comes in. Our model, Pegasus, doesn't read words; it reads numbers. Specifically, it needs token IDs. Our goal is to convert each dialogue-summary pair into a format the model can train on.

This is handled by the `convert_examples_to_features` function. It takes a batch of examples and uses a pre-trained tokenizer to create the necessary inputs:

*   `input_ids`: The numerical representation of the dialogue text.
*   `attention_mask`: A binary tensor that tells the model which tokens to pay attention to (and which are just padding).
*   `labels`: The numerical representation of the target summary.

Here’s the code that makes it happen:

```python
# From: src/text_summarizer/components/data_transformation.py

class DataTransformation:
    # ...
    def convert_examples_to_features(self, example_batch: dict) -> dict:
        input_encodings = self.tokenizer(
            example_batch["dialogue"], max_length=1024, truncation=True
        )

        with self.tokenizer.as_target_tokenizer():
            target_encodings = self.tokenizer(
                example_batch["summary"], max_length=128, truncation=True
            )

        return {
            "input_ids": input_encodings["input_ids"],
            "attention_mask": input_encodings["attention_mask"],
            "labels": target_encodings["input_ids"],
        }
```
With our data properly tokenized and formatted, it's saved to disk, ready to be fed into the training component.

## Stage 3: Firing Up the Engine (Model Training)

This is the most computationally intensive part of our pipeline. We aren't training a model from scratch; instead, we're using **transfer learning** to fine-tune a massive, pre-trained model: `google/pegasus-cnn_dailymail`. This model already has a deep understanding of the English language, and our job is to adapt it to the specific task of summarizing conversational dialogue from the SAMSum dataset.

The HuggingFace `Trainer` class makes this process incredibly streamlined. It handles the entire training loop, from feeding batches of data to the model to calculating the loss and updating the model's weights.

Crucially, it integrates directly with our configuration-driven design. We instantiate `TrainingArguments` using the hyperparameters we defined in our `params.yaml` file. This is where the power of our architecture shines—to run a new experiment with a different batch size or learning rate, we just change the YAML file, not the code.

```python
# From: src/text_summarizer/components/model_trainer.py

from transformers import TrainingArguments, Trainer

class ModelTrainer:
    # ...
    def train(self) -> None:
        # ... (device and model setup)

        trainer_args = TrainingArguments(
            output_dir=self.config.root_dir,
            num_train_epochs=self.params.num_train_epochs,
            warmup_steps=self.params.warmup_steps,
            per_device_train_batch_size=self.params.per_device_train_batch_size,
            # ... more arguments from params.yaml
        )

        trainer = Trainer(
            model=model_pegasus,
            args=trainer_args,
            tokenizer=tokenizer,
            data_collator=seq2seq_data_collator,
            train_dataset=dataset_samsum_pt["test"],
            eval_dataset=dataset_samsum_pt["validation"],
        )

        trainer.train()
```
After the training process completes, the fine-tuned model and its tokenizer are saved as artifacts in the `artifacts/model_trainer` directory.

## Stage 4: The Quality Check (Model Evaluation)

Our model is trained, but is it any good? The final stage in our ML workflow is **Model Evaluation**, where we quantitatively measure the quality of our model's summaries against the reference summaries in the test set.

For summarization tasks, the standard metric is **ROUGE** (Recall-Oriented Understudy for Gisting Evaluation). It measures the overlap between the model-generated summary and the human-written reference summary. We focus on a few key ROUGE scores:

*   **ROUGE-1:** Measures the overlap of individual words (unigrams).
*   **ROUGE-2:** Measures the overlap of word pairs (bigrams).
*   **ROUGE-L:** Measures the longest common subsequence of words, which rewards keeping sentence structure intact.

Our `ModelEvaluation` component iterates through the test set, generates a summary for each dialogue, and compares it to the reference using the HuggingFace `evaluate` library.

The final scores are compiled into a CSV file, giving us a clear, objective measure of our model's performance.

## The Engine is Built and Tested

We've successfully journeyed through the entire machine learning workflow. We started with raw data, transformed it into a model-ready format, fine-tuned a powerful Transformer model, and rigorously evaluated its performance. Thanks to our MLOps pipeline, this entire process is now automated and repeatable.

We have a proven, high-quality model. But right now, it’s just a set of files sitting in our `artifacts` folder. It’s an engine without a car. How do we make it accessible and useful to the outside world?

---

### **Coming Up in Part 3...**

We have the blueprint and the engine. In the final part of this series, [**"Serving the World: Deploying the Summarizer with FastAPI and Docker,"**](posts/text-summarizer-journey-serving-the-model-part-3.html) we'll build the chassis. I’ll show you how to wrap our trained model in a fast, modern API and containerize the entire application, turning our powerful model into a portable, production-ready service that anyone can use. Stay tuned!
