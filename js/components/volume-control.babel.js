
import Module       from './module'
import LabelButton  from './label-button';
import Slider       from './slider';

require('../../css/blocks/volume-control.postcss.css');
let CLASSES = require('../../css/blocks/volume-control.postcss.css.json');

class VolumeControl extends Module {
  /*
    Method to declare defaults for the module.
    @private
    @overrides @ Module
  */
  _declareDefaults () {
    super._declareDefaults();
    this._defaults.isOn           = false;
    this._defaults.volume         = 1;
    this._defaults.progress       = .5;
    this._defaults.onVolumeChange = null;
    this._defaults.onIsVolume     = null;
    this._defaults.muted          = false;
  }
  /*
    Method to reset volume to 1x.
    @public
    @returns this
  */
  reset () { this._onDoubleTap(); }
  /*
    Method to decrease volume value.
    @public
    @param {Number} Value that the slider should be decreased by.
    @returns this.
  */
  decreaseVolume ( amount = 0.01 ) {
    let p = this._props;
    p.progress -= amount;
    p.progress = ( p.progress < 0 ) ? 0 : p.progress;
    this.slider.setProgress( p.progress );
    return this;
  }
  /*
    Method to inclease volume value.
    @public
    @param {Number} Value that the slider should be increased by.
    @returns this.
  */
  increaseVolume ( amount = 0.01 ) {
    let p = this._props;
    p.progress += amount;
    p.progress = ( p.progress > 1 ) ? 1 : p.progress;
    this.slider.setProgress( p.progress );
    return this;
  }
  /*
    Initial render method.
    @private
    @overrides @ Module
  */
  _render () {
    let p         = this._props,
        className = 'volume-control',
        slider    = this._createElement( 'div' ),
        sliderIn  = this._createElement( 'div' ),
        icon      = this._createElement( 'div' );

    this._addMainElement();
    this.el.classList.add( CLASSES[ className ] );
    // places for child components
    slider.classList.add( CLASSES[ `${ className }__slider` ] );
    // sliderIn.classList.add( CLASSES[ `${ className }__slider-inner` ] );
    // slider.appendChild( sliderIn );
    this.el.appendChild( slider );
    // child components
    this.labelButton = new LabelButton({
      parent:         this.el,
      isOn:           p.isOn,
      className:      CLASSES[ `${ className }__icon` ],
      onStateChange:  this._onButtonStateChange.bind( this ),
      onDoubleTap:    this._onDoubleTap.bind( this )
    });
    this.slider      = new Slider({
      parent:       slider,
      isProgress:   false,
      direction:    'y',
      onProgress:   this._onSliderProgress.bind( this ),
      snapPoint:    .5,
      snapStrength: .05
    });
    this.slider.setProgress( this._props.volume );
  }
  /*
    Method that is invoked on slider progress.
    @private
    @param {Number} Progress of the slider.
  */
  _onSliderProgress ( p ) {
    if (isNaN(p)) p = 1;
    // progress should be at least 0.01
    p = Math.max( p, 0.0001 );

    let props = this._props,
        args  = [  ];

    props.progress = p

    this._callIfFunction( props.onVolumeChange, p, p );
    this.labelButton.setLabelText( this._progressToLabel( props.progress ) );
  }
  /*
    Method that is invoked on button state change.
    @private
    @param {Boolean} State of the button switch.
  */
  _onButtonStateChange ( isOn ) {
    let method = ( isOn ) ? 'add' : 'remove' ;
    this.el.classList[ method ]( CLASSES[ 'is-on' ] );
    this._callIfFunction( this._props.onIsVolume, isOn );
  }
  /*
    Method to recalc progress to label string.
    @private
    @param {Number} Progress [0...1].
    @returns {String} String for a label to set.
  */
  _progressToLabel ( progress ) {
    return `${ Math.round(progress * 100) }%`;
  }
  /*
    Method that is invoked on double button tap.
    @private
  */
  _onDoubleTap () {

    // capture the initial volume
    if (!this._props.muted) {
      this._props.volumeCache = this.slider._progress;
      this.slider.setProgress(0);
    } else {
      let restore = this._props.volumeCache;
      if (Math.round(restore * 100) <= 0) restore = 0.5;
      this.slider.setProgress(restore);
    }

    // toggle mutted
    this._props.muted = !this._props.muted;

    this.labelButton.off();
  }
}

export default VolumeControl;
