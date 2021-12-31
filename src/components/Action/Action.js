import React, { useState } from "react";
import cn from "classnames/bind";
import styles from "./Action.module.scss";
import Switch from "react-ios-switch";
import { Checkbox, Drawer } from "antd";

import update from "immutability-helper";
const cx = cn.bind(styles);

const Action = ({
  filterCheckbox,
  handleChangeCheckbox,
  setMin,
  setMax,
  min,
  max,
  submit,
  visibleAction,
  setVisibleAction,
  setWallet,
  wallet,
  filterWallet,
  resetFilter
}) => {
  const [checked, setChecked] = useState(false);

  const clickClose = () => {
    setVisibleAction(!visibleAction);
  };

  const handleCheckboxLocal = (e) => {
    handleChangeCheckbox(e);
  };
  const walletSubmit = (e) => {
    e.preventDefault();
    filterWallet();
    
  }
  return (
    <div className={cx("container")}>
      <button
        className={cx(
          "close-btn",
          !visibleAction ? cx("close-btn--left") : cx("close-btn--right")
        )}
        onClick={clickClose}
      >
        {" "}
        {!visibleAction ? ">" : "<"}{" "}
      </button>
      <Drawer
        mask={false}
        autoFocus={false}
        placement="left"
        visible={visibleAction}
        className={cx("action")}
        style={{ visibility: !visibleAction && "hidden" }}
        destroyOnClose={false}
      >
        <div className={cx("title-wraper")}>
          <div className={cx("title")}>Map</div>
          <div className={cx("clear")} onClick={resetFilter}>Clear</div>
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
        <form onChange={handleCheckboxLocal}>
          <div className={cx("status")}>
            <Checkbox.Group name="sale" value={filterCheckbox.sale}>
              <div className={cx("status-item")}>
                <Checkbox className={cx("check-box")} value={1} />

                <div className={cx("square-color-1")}></div>
                <div className={cx("status-title")}>For Sale</div>
              </div>
              <div className={cx("status-item")}>
                <Checkbox className={cx("check-box")} value={2} />
                <div className={cx("square-color-2")}></div>
                <div className={cx("status-title")}>Premium</div>
              </div>
              <div className={cx("status-item")}>
                <Checkbox className={cx("check-box")} value={3} />
                <div className={cx("square-color-3")}></div>
                <div className={cx("status-title")}>On OpenSea</div>
              </div>
            </Checkbox.Group>
          </div>
          <hr />
          <div className={cx("find-land")}>Find LAND on OpenSea </div>
          <hr />
          <div className={cx("size")}>
            <div className={cx("size-title")}>Size</div>

            <Checkbox.Group name="size" value={filterCheckbox.size}>
              <div className={cx("size-item")}>
                <Checkbox className={cx("check-box")} value={4} />
                <div className={cx("size-name")}>4x4</div>
              </div>
              <div className={cx("size-item")}>
                <Checkbox className={cx("check-box")} value={3} />
                <div className={cx("size-name")}>3x3</div>
              </div>
              <div className={cx("size-item")}>
                <Checkbox className={cx("check-box")} value={2} />
                <div className={cx("size-name")}>2x2</div>
              </div>
              <div className={cx("size-item")}>
                <Checkbox className={cx("check-box")} value={1} />
                <div className={cx("size-name")}>1x1</div>
              </div>
            </Checkbox.Group>
          </div>
        </form>
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
          <button className={cx("btn")} onClick={submit} disabled={(min === "" || min === "") ? true: false}>
            Apply
          </button>
        </div>
        <hr />
        <div className={cx("wallet")}>

          <div className={cx("title")}>Wallet</div>
<form onSubmit={walletSubmit}>
          <input name="wallet" value={wallet} onChange={(e) => setWallet(e.target.value) }/>
          </form>
        </div>
        <hr />
        <div className={cx("partners")}>
          <div className={cx("title")}>Partners</div>
          
            <input name="partners" />

      
          <div className={cx("list")}>
            <div className={cx("list-item")}>Care Bears</div>
            <div className={cx("list-item")}>Binance</div>
            <div className={cx("list-item")}>CoinMarketCap</div>
            <div className={cx("list-item")}>Gemini</div>
            <div className={cx("list-item")}>Gemini</div>
            <div className={cx("list-item")}>Gemini</div>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
export default Action;
