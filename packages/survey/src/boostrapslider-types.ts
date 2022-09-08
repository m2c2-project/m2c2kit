interface RangeHighlight {
  class?: string | undefined;
  start?: number | undefined;
  end?: number | undefined;
}

export interface SliderOptions {
  /**
   * Default: ''
   * set the id of the slider element when it's created
   */
  id?: string | undefined;
  /**
   * Default: 0
   * minimum possible value
   */
  min?: number | undefined;
  /**
   * Default: 10
   * maximum possible value
   */
  max?: number | undefined;
  /**
   * Default: 1
   * increment step
   */
  step?: number | undefined;
  /**
   * Default: number of digits after the decimal of step value
   * The number of digits shown after the decimal. Defaults to the number of digits after the decimal of step value.
   */
  precision?: number | undefined;
  /**
   * Default: 'horizontal'
   * set the orientation. Accepts 'vertical' or 'horizontal'
   */
  orientation?: string | undefined;
  /**
   * Default: 5
   * initial value. Use array to have a range slider.
   */
  value?: number | number[] | undefined;
  /**
   * Default: false
   * make range slider. Optional if initial value is an array. If initial value is scalar, max will be used for second value.
   */
  range?: boolean | undefined;
  /**
   * Default: 'before'
   * selection placement. Accepts: 'before', 'after' or 'none'. In case of a range slider, the selection will be placed between the handles
   */
  selection?: string | undefined;
  /**
   * Default: 'show'
   * whether to show the tooltip on drag, hide the tooltip, or always show the tooltip. Accepts: 'show', 'hide', or 'always'
   */
  tooltip?: string | undefined;
  /**
   * Default: false
   * if false show one tootip if true show two tooltips one for each handler
   */
  tooltip_split?: boolean | undefined;
  /**
   * Default: null
   * Position of tooltip, relative to slider. Accepts 'top'/'bottom' for
   * horizontal sliders and 'left'/'right' for vertically orientated sliders.
   * Default positions are 'top' for horizontal and 'right' for vertical
   * slider.
   */
  tooltip_position?: "top" | "bottom" | "left" | "right" | undefined;
  /**
   * Default: 'round'
   * handle shape. Accepts: 'round', 'square', 'triangle' or 'custom'
   */
  handle?: string | undefined;
  /**
   * Default: false
   * whether or not the slider should be reversed
   */
  reversed?: boolean | undefined;
  /**
   * Default: 'auto'
   */
  rtl?: boolean | "auto" | undefined;
  /**
   * Default: true
   * whether or not the slider is initially enabled
   */
  enabled?: boolean | undefined;
  /**
   * Default: returns the plain value
   * formatter callback. Return the value wanted to be displayed in the tooltip
   * @param val the current value to display
   */
  formatter?(val: number): string;
  /**
   * Default: false
   * The natural order is used for the arrow keys. Arrow up select the upper slider value for vertical sliders,
   * arrow right the righter slider value for a horizontal slider - no matter if the slider was reversed or not.
   * By default the arrow keys are oriented by arrow up/right to the higher slider value, arrow down/left to the lower slider value.
   */
  natural_arrow_keys?: boolean | undefined;
  /**
   * Default: [ ]
   * Used to define the values of ticks. Tick marks are indicators to denote special values in the range. This option overwrites min and max options.
   */
  ticks?: number[] | undefined;
  /**
   * Default: [ ]
   * Defines the positions of the tick values in percentages. The first value should alwasy be 0, the last value should always be 100 percent.
   */
  ticks_positions?: number[] | undefined;
  /**
   * Default: [ ]
   * Defines the labels below the tick marks. Accepts HTML input.
   */
  ticks_labels?: string[] | undefined;
  /**
   * Default: 0
   * Used to define the snap bounds of a tick. Snaps to the tick if value is within these bounds.
   */
  ticks_snap_bounds?: number | undefined;
  /**
   * Default: false
   * Used to allow for a user to hover over a given tick to see it's value.
   * Useful if custom formatter passed in
   */
  ticks_tooltip?: boolean | undefined;
  /**
   * Default: 'linear'
   * Set to 'logarithmic' to use a logarithmic scale.
   */
  scale?: "linear" | "logarithmic" | undefined;
  /**
   * Default: false
   * Focus the appropriate slider handle after a value change.
   */
  focus?: boolean | undefined;
  /**
   * Default: null
   * ARIA labels for the slider handle's, Use array for multiple values in a
   * range slider.
   */
  labelledby?: string | string[] | undefined;
  /**
   * Default: []
   * Defines a range array that you want to highlight, for example:
   * [{'start':val1, 'end': val2, 'class': 'optionalAdditionalClassName'}].
   */
  rangeHighlights?: RangeHighlight[] | undefined;
  /**
   * Default: false
   * Lock the selection to the values defined in the ticks array.
   */
  lock_to_ticks?: boolean | undefined;
}
