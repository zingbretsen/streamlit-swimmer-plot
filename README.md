# streamlit-custom-component

Streamlit component that allows you to make swim plots.

## Installation instructions

```sh
pip install /path/to/streamlit-swim-plot
```

## Usage instructions

```python
import streamlit as st

from swim_plot import swim_plot 


data = [
    {"Label":"A","Start Date":"2023-08-01","End Date":"2023-08-10"},
    {"Label":"A","Start Date":"2023-08-11","End Date":"2023-08-12"},
    {"Label":"B","Start Date":"2023-08-05","End Date":"2023-08-15"},
    {"Label":"C","Start Date":"2023-08-10","End Date":"2023-08-20"},
    {"Label":"D","Start Date":"2023-08-15","End Date":"2023-08-25"}
]
value = swim_plot(data)

st.write(value)
```