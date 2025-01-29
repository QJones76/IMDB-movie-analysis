# Understanding the Correlation Heatmap

## What is a Correlation Heatmap?

A **correlation heatmap** is a visual tool that helps identify relationships between multiple metrics in your data. It shows how two metrics move in relation to each other using **correlation coefficients**, which are numerical values ranging from `-1` to `1`.

- **Positive Correlation** (`> 0`): When one metric **increases**, the other tends to **increase**.
- **Negative Correlation** (`< 0`): When one metric **increases**, the other tends to **decrease**.
- **No Correlation** (`≈ 0`): **No clear relationship** between two metrics exists.

The heatmap uses colors to represent these values:
- **Dark colors** represent **strong correlations**. In this UI: the *darker* the **red**, the *stronger* the **positive correlation**, and the **darker the blue**, the *stronger* the **negative correlation**.
- **Lighter colors** represent **weaker correlation** or **no correlation**.  In this UI, the *lighter* the **red**, the *weaker* the **positive correlation**, and the *lighter* the **blue**, the *weaker* the **negative correlation**.

---

## What are Correlation Coefficients?

A **correlation coefficient** quantifies the strength and direction of a relationship between two metrics. Here's a quick interpretation:

| Coefficient Value | Meaning                           | Example                                        |
|--------------------|-----------------------------------|-----------------------------------------------|
| `1`               | Perfect positive correlation      | Metric A and B always increase together.      |
| `0.5`             | Moderate positive correlation     | Metric A and B increase, but not always.      |
| `0`               | No correlation                   | Metric A and B are unrelated.                 |
| `-0.5`            | Moderate negative correlation     | Metric A increases, B decreases sometimes.    |
| `-1`              | Perfect negative correlation      | Metric A increases, B always decreases.       |

---

## Why is This Important for You?

The correlation heatmap helps answer key questions, such as:
- **Which metrics tend to move together?**
- **Are there surprising relationships?**

By understanding these relationships, you can:
1. Prioritize movies with metrics that drive success.
2. Identify unexpected insights.

---

## Example Insights from the Data


Here are some key findings from the analysis of the last 20 years of movie releases:
- **Strong Positive Correlation**: A `0.89` correlation between yearly changes in **budget** and **average rating**, indicating that movies with higher budgets tend to yield higher ratings.
- **No Correlation**: A `0.06` correlation between yearly changes in **vote number** and **average rating**, suggests that the number of votes and the average rating are unrelated.

---
