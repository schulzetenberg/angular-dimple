<h2>
    Stacked Area
    <span class="api-link">
      <a href="/documentation/#line-graph">Stacked Area Documentation</a>
    </span>
</h2>

<div class="white-panel">
  <graph data="graphData">
    <x field="Month" order-by="Date"></x>
    <y field="Unit Sales"></y>
    <legend></legend>
    <stacked-area field="Owner"></area>
  </graph>
</div>

```html
<!-- Default Stacked -->
<graph data="graphData">
  <x field="Month" order-by="Date"></x>
  <y field="Unit Sales"></y>
  <legend></legend>
  <stacked-area field="Owner"></area>
</graph>
```

<div class="white-panel">
  <graph data="graphData" width="100%" height="600px">
    <x group-by="Owner" field="Month" order-by="Date" type="Category" title="Cream, Get the Money"></x>
    <y field="Unit Sales" type="Measure" title="Dollah Dolah Bill Yall"></y>
    <stacked-area field="Owner" value="Aperture" series='SKU' series-val="Theta Pack 6 Standard, Theta Pacl 18 Standard"></stacked-area>
    <stacked-area field="Owner" value="Black Mesa" series='SKU'></stacked-area>
    <stacked-area field="Owner" value="Tyrell Corp" series='SKU'></stacked-area>
  </graph>
</div>

```html
<!-- Grouped, with Attrs -->
<graph data="graphData" width="100%" height="600px">
  <x group-by="Owner" field="Month" order-by="Date" type="Category" title="Cream, Get the Money"></x>
  <y field="Unit Sales" type="Measure" title="Dollah Dolah Bill Yall"></y>
  <stacked-area field="Owner" value="Aperture" series='SKU' series-val="Theta Pack 6 Standard, Theta Pacl 18 Standard"></stacked-area>
  <stacked-area field="Owner" value="Black Mesa" series='SKU'></stacked-area>
  <stacked-area field="Owner" value="Tyrell Corp" series='SKU'></stacked-area>
</graph>
```