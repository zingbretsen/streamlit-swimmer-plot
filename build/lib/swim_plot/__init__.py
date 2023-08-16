import os
from datetime import date

import streamlit.components.v1 as components

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = True

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

component_name = 'swim_plot'
if not _RELEASE:
    _component_func = components.declare_component(
        component_name,
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component(component_name, path=build_dir)


def swim_plot(data, key=None):
    """
    Parameters
    ----------
    n: int
        The name of the thing we're saying hello to. The component will display
        the text "Hello, {name}!"
    key: str or None
        An optional key that uniquely identifies this component. If this is
        None, and the component's arguments are changed, the component will
        be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    None

    """
    component_value = _component_func(key=key, data=data, default="")

    return component_value


if not _RELEASE:
    from datetime import date

    from typing import List
    from typing import Tuple

    import streamlit as st

    #from swim_plot import swim_plot


    st.title("Swim Plot Example")

    data = [
        {
            "Label": "Medication A",
            "Start Date": "2023-07-01",
            "End Date": "2023-07-10",
        },
        {
            "Label": "Medication A",
            "Start Date": "2023-07-11",
            "End Date": "2023-07-12",
        },
        {
            "Label": "Medication B",
            "Start Date": "2023-07-05",
            "End Date": "2023-07-15",
        },
        {
            "Label": "Medication C",
            "Start Date": "2023-07-10",
            "End Date": "2023-07-20",
        },
        {
            "Label": "Medication D",
            "Start Date": "2023-01-15",
            "End Date": "2023-03-25",
        },
        {
            "Label": "Medication D",
            "Start Date": "2023-06-15",
            "End Date": "2023-06-25",
        },
        {
            "Label": "Medication D",
            "Start Date": "2023-07-15",
            "End Date": "2023-08-14",
        },
    ]


    def n_months_before_today(n):
        today = date.today()
        year = today.year - (n // 12)
        month = today.month - (n % 12)
        
        if month <= 0:
            year -= 1
            month += 12
        
        day = today.day
        while day > 0:
            try:
                target_date = date(year, month, today.day)
                return target_date
            except ValueError:
                day -= 1

        return today

    min_date = date.fromisoformat(min([d['Start Date'] for d in data]))
    max_date = date.fromisoformat(max([d['Start Date'] for d in data]))

    # Various ways of selecting the earliest date to show
    with st.sidebar:
        start_date = st.date_input("Choose a starting date:",
                                value=min_date,
                                min_value = min_date,
                                max_value = max_date,
                                )
        times = st.radio("Times", options=('All', 'Last 6 months'))
        months = st.slider("Months", 12, 1, 36)
        slider_date = n_months_before_today(months)

    if times == "Last 6 months":
        times_date = date(2023, 2, 1)
    else:
        times_date = start_date

    start_date = max([slider_date, start_date, times_date])

    data = sorted(data, key=lambda x: x['End Date'], reverse=True)
    data = [d for d in data if date.fromisoformat(d['Start Date']) >= start_date]
    print(data)

    swim_plot(data, key='a')

