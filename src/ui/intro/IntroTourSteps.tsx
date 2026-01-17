

export const IntroTourSteps = [

    {
        selector: ".sproud",
        content: (
            <div style={{ lineHeight: "1.5em", maxWidth: "300px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Trees Planted</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span role="img" aria-label="Trees">🌱</span>
                    <div>
                        Total area of trees planted (in hectares) since the start of the simulation.
                    </div>
                </div>
            </div>
        ),
    },

    {
        selector: ".thermometer",
        content: (
            <div style={{ lineHeight: "1.5em", maxWidth: "300px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Global Warming</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span role="img" aria-label="Thermometer">🌡️</span>
                    <div>
                        Temperature increase relative to pre-industrial levels (in °C).
                    </div>
                </div>
            </div>
        ),
    },

    {
        selector: ".tour-controls",
        content: (
            <div style={{ lineHeight: "1.5em", maxWidth: "300px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Simulation Controls</h4>
                <p>
                    <strong>Heatmap:</strong> Toggle to show global temperature heatmap.
                </p>
                <p>
                    <strong>Emissions:</strong> Adjust the annual global CO₂ emissions growth rate per year(in %).
                </p>
                <p>
                    <strong>Reforestation:</strong> Set the number of hectares planted per year in the 10 countries where it is most effective.


                </p>
                To run the simulation automatically, just press "Start"!
            </div>
        ),
    },
    {
        selector: ".sideControlsPanel",
        content: (
            <div style={{ lineHeight: "1.5em", maxWidth: "300px" }}>
                Press This button to hide the Simulation controls
            </div>
        ),
    },
    {
        selector: ".tour-timeline",
        content: (
            <div style={{ lineHeight: "1.5em", maxWidth: "300px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Timeline</h4>
                <p>
                    Use the timeline to explore how the simulation evolves over time.
                </p>
                <p>
                    <strong>Tipping Points:</strong> These are critical events marked at certain years. If exceeded, they will be displayed. You can also hover over them beforehand to see what they represent.
                </p>
            </div>
        ),
    },
];
