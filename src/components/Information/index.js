import React, { useState } from "react";
import { Drawer } from "antd";
import styles from "./index.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(styles);
const Information = ({ visible, field, isEmpty, onClose }) => {
  
  return (
    <Drawer
      className={cx("info")}
      mask={false}
      autoFocus={false}
      title="Infomation"
      placement="right"
      onClose={onClose}
      visible={visible}
      width={window.innerWidth > 800 ? 420 : window.innerWidth}
      style={{ marginTop: 50 }}
    >
      {!isEmpty(field) && visible && (
        <>
          <div className={cx("header")}>
            <button className={cx("close-btn")} onClick={onClose}>X</button>
            <div className={cx("img-wraper")}>
              <img src={field.img || "green.jpg"} />{" "}
            </div>
            <div className={cx("name")}>Name: {field.name || field.id}</div>
            <div className={cx("link-site")}>Visit site</div>
          </div>
          <div className={cx("body")}>
          <div className={cx("location")}>
           
            Location: 
            
          </div>
          <div className={cx("location-value")}>{field.rowStartNew},{field.colStartNew}</div>
          <div>
            Size: {field.position.rowEnd - field.position.rowStart + 1} x{" "}
            {field.position.rowEnd - field.position.rowStart + 1}
          </div>
          </div>
          
        </>
      )}
    </Drawer>
  );
};
export default Information;
