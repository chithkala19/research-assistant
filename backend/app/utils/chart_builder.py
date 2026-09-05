import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import base64
import io
import logging
import json

logger = logging.getLogger(__name__)

sns.set_theme(style="whitegrid", palette="deep")

def build_chart(chart_data: dict) -> str:
    """Build a chart from structured data and return as base64-encoded PNG."""
    try:
        if isinstance(chart_data, str):
            chart_data = json.loads(chart_data)
        chart_type = chart_data.get("chart_type", "bar").lower()
        title = chart_data.get("title", "Chart")
        xlabel = chart_data.get("xlabel", "")
        ylabel = chart_data.get("ylabel", "Value")
        labels = chart_data.get("labels", [])
        series = chart_data.get("series", {})
        fig, ax = plt.subplots(figsize=(10, 6))
        if chart_type == "bar":
            _build_bar_chart(ax, labels, series)
        elif chart_type == "line":
            _build_line_chart(ax, labels, series)
        elif chart_type == "pie":
            _build_pie_chart(ax, labels, series)
        elif chart_type == "scatter":
            _build_scatter_chart(ax, labels, series)
        elif chart_type == "heatmap":
            _build_heatmap(fig, ax, labels, series)
        else:
            _build_bar_chart(ax, labels, series)
        ax.set_title(title, fontsize=14, fontweight='bold', pad=15)
        if xlabel and chart_type != "pie":
            ax.set_xlabel(xlabel, fontsize=11)
        if ylabel and chart_type != "pie":
            ax.set_ylabel(ylabel, fontsize=11)
        plt.tight_layout()
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight',
                    facecolor='white', edgecolor='none')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        return img_base64
    except Exception as e:
        logger.error(f"Error building chart: {e}")
        plt.close('all')
        return _error_chart(str(e))

def _build_bar_chart(ax, labels, series):
    import numpy as np
    n_series = len(series)
    n_labels = len(labels) if labels else 0
    if n_series == 0 or n_labels == 0:
        ax.text(0.5, 0.5, 'No data', ha='center', va='center', transform=ax.transAxes)
        return
    x = np.arange(n_labels)
    width = 0.8 / n_series
    colors = sns.color_palette("deep", n_series)
    for i, (name, values) in enumerate(series.items()):
        offset = (i - n_series / 2 + 0.5) * width
        bars = ax.bar(x + offset, values[:n_labels], width, label=name, color=colors[i],
                     edgecolor='white', linewidth=0.5)
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height:.1f}' if isinstance(height, float) else str(height),
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3), textcoords="offset points",
                       ha='center', va='bottom', fontsize=8)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45, ha='right')
    if n_series > 1:
        ax.legend()

def _build_line_chart(ax, labels, series):
    colors = sns.color_palette("deep", len(series))
    markers = ['o', 's', '^', 'D', 'v', '<', '>', 'p', '*', 'h']
    for i, (name, values) in enumerate(series.items()):
        marker = markers[i % len(markers)]
        ax.plot(labels[:len(values)], values, marker=marker, label=name,
               color=colors[i], linewidth=2, markersize=6)
    if len(series) > 1:
        ax.legend()
    ax.tick_params(axis='x', rotation=45)

def _build_pie_chart(ax, labels, series):
    if not series:
        ax.text(0.5, 0.5, 'No data', ha='center', va='center', transform=ax.transAxes)
        return
    first_series = list(series.values())[0]
    colors = sns.color_palette("pastel", len(labels))
    wedges, texts, autotexts = ax.pie(
        first_series[:len(labels)], labels=labels, autopct='%1.1f%%',
        colors=colors, startangle=90, pctdistance=0.85
    )
    for text in texts:
        text.set_fontsize(10)
    for autotext in autotexts:
        autotext.set_fontsize(8)
        autotext.set_fontweight('bold')
    ax.axis('equal')

def _build_scatter_chart(ax, labels, series):
    colors = sns.color_palette("deep", len(series))
    series_list = list(series.values())
    if len(series_list) >= 2:
        x_data = series_list[0]
        y_data = series_list[1]
        series_names = list(series.keys())
        ax.scatter(x_data, y_data, color=colors[0], alpha=0.7, s=60, edgecolors='white')
        ax.set_xlabel(series_names[0])
        ax.set_ylabel(series_names[1])
    elif len(series_list) == 1:
        values = series_list[0]
        ax.scatter(range(len(values)), values, color=colors[0], alpha=0.7, s=60)

def _build_heatmap(fig, ax, labels, series):
    import numpy as np
    data = list(series.values())
    if not data:
        ax.text(0.5, 0.5, 'No data', ha='center', va='center', transform=ax.transAxes)
        return
    data_array = np.array(data)
    sns.heatmap(data_array, ax=ax, annot=True, fmt='.1f',
               xticklabels=labels if labels else True,
               yticklabels=list(series.keys()),
               cmap='YlOrRd', linewidths=0.5)

def _error_chart(error_msg: str) -> str:
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.text(0.5, 0.5, f'Chart Error:\n{error_msg[:100]}',
           ha='center', va='center', transform=ax.transAxes,
           fontsize=12, color='red', wrap=True)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    buffer = io.BytesIO()
    fig.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    plt.close(fig)
    return img_base64
