import React, { useState } from "react";
import cn from "classnames/bind";
import styles from "./Action.module.scss";
import Switch from "react-ios-switch";
import { Checkbox, Drawer } from "antd";

const cx = cn.bind(styles);

const Action = ({ resetCoordinate,handleFilter, setMin, setMax, min, max, submit,visibleAction,setVisibleAction }) => {
  const [checked, setChecked] = useState(false);
  
  
  const clickClose = () => {
    
    setVisibleAction(!visibleAction)
  }
  return (
    <div className={cx("container")}>
      <button 
      className={cx("close-btn", !visibleAction ? cx("close-btn--left") : cx("close-btn--right"))} 
      onClick={clickClose}
      style={{left: `${!visibleAction ? '95px' : "335px"}`}}
      > {!visibleAction ? ">" : "<" } </button>
      <Drawer
        mask={false}
        autoFocus={false}
        placement="left"
        visible={visibleAction}
        className={cx("action")}
        
      >
        <div className={cx("title-wraper")}>
          <div className={cx("title")}>Map</div>
          <div className={cx("clear")}>Clear</div>
        </div>
        <hr />
        <div className={cx("litemap")}>
          <div>Lite map</div>
          <Switch
            offColor="#a0a4a7"
            checked={checked}
            onChange={(checked) => {
              setChecked(checked);
            }}
          />
        </div>
        <hr />
        <div className={cx("status")}>
          <div className={cx("status-item")}>
            <Checkbox className={cx("check-box")} disabled/>

            <div className={cx("square-color-1")}></div>
            <div className={cx("status-title")}>For Sale</div>
          </div>
          <div className={cx("status-item")}>
            <Checkbox className={cx("check-box")} disabled/>
            <div className={cx("square-color-2")}></div>
            <div className={cx("status-title")}>For Sale</div>
          </div>
          <div className={cx("status-item")}>
            <Checkbox className={cx("check-box")} disabled/>
            <div className={cx("square-color-3")}></div>
            <div className={cx("status-title")}>For Sale</div>
          </div>
        </div>
        <hr />
        <div className={cx("find-land")}>Find LAND on OpenSea </div>
        <hr />
        <div className={cx("size")}>
          <div className={cx("size-title")}>Size</div>
          <div className={cx("size-item")}>
            <Checkbox
              className={cx("check-box")}
              value={4}
              onChange={(value) => handleFilter(value)}
            />
            <div className={cx("size-name")}>4x4</div>
          </div>
          <div className={cx("size-item")}>
            <Checkbox
              className={cx("check-box")}
              value={3}
              onChange={(value) => handleFilter(value)}
            />
            <div className={cx("size-name")}>3x3</div>
          </div>
          <div className={cx("size-item")}>
            <Checkbox
              className={cx("check-box")}
              value={2}
              onChange={(value) => handleFilter(value)}
            />
            <div className={cx("size-name")}>2x2</div>
          </div>
          <div className={cx("size-item")}>
            <Checkbox
              className={cx("check-box")}
              value={1}
              onChange={(value) => handleFilter(value)}
            />
            <div className={cx("size-name")}>1x1</div>
          </div>
        </div>

        <hr />

        <div className={cx("coordinates")}>
          <div className={cx("coordinates-title")}>Coordinates</div>
          <div className={cx("coordinates-body")}>
            <div>
              <div>Min(X,Y)</div>
              <input
                name="min"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="0,0"
              />
            </div>
            <div>
              <div>Max(X,Y)</div>
              <input
                name="max"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="10,8"
              />
            </div>
          </div>
        </div>
        <div className={cx("btn-wrapper")}>
          <button className={cx("btn")} onClick={submit}>
            Apply
          </button>
          <button className={cx("btn")} onClick={resetCoordinate}>
            Reset 
          </button>
        </div>
      </Drawer>
    </div>
  );
};
export default Action;
