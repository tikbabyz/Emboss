"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Sarabun",
  fonts: [
    {
      src: "/fonts/Sarabun-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Sarabun-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// ขนาดกระดาษ 100 x 45 มม. (แปลงเป็น Points: 100 * 2.83464567 = 283.46, 45 * 2.83464567 = 127.56)
const LABEL_WIDTH = 283.46;
const LABEL_HEIGHT = 127.56;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    padding: 4,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  tagContainer: {
    width: 275,
    height: 118,
    borderWidth: 1.5,
    borderColor: "#000000",
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  // ฝั่งซ้าย: QR Code + ช่อง Roll ด้านล่าง
  qrSection: {
    width: 84,
    borderRightWidth: 1.5,
    borderColor: "#000000",
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  qrImageBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
  },
  qrImage: {
    width: 72,
    height: 72,
  },
  qrRollBox: {
    height: 22,
    borderTopWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  qrRollText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#000000",
  },
  // ฝั่งขวา: ตารางข้อมูล 5 แถว (Job, Part No, Description, Lot No, Qty)
  tableContainer: {
    flex: 1,
    flexDirection: "column",
  },
  rowNormal: {
    height: 20,
    borderBottomWidth: 1,
    borderColor: "#000000",
    flexDirection: "row",
  },
  rowDesc: {
    height: 38,
    borderBottomWidth: 1,
    borderColor: "#000000",
    flexDirection: "row",
  },
  rowLast: {
    height: 20,
    flexDirection: "row",
  },
  cellLabel: {
    width: 62,
    borderRightWidth: 1.2,
    borderColor: "#000000",
    justifyContent: "center",
    paddingLeft: 6,
    paddingRight: 2,
  },
  cellValue: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 6,
    paddingRight: 4,
  },
  labelText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#000000",
  },
  valueText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#000000",
  },
  descText: {
    fontSize: 7.2,
    fontWeight: 700,
    color: "#000000",
    lineHeight: 1.2,
  },
});

export const SingleLabelPage = ({ data = {}, qrCodeUrl = "" }) => {
  const rollDisplay =
    data.rollNo && data.totalRolls
      ? `${data.rollNo}/${data.totalRolls}`
      : data.rollNo || "-";

  return (
    <Page size={[LABEL_WIDTH, LABEL_HEIGHT]} style={styles.page}>
      <View style={styles.tagContainer}>
        {/* ฝั่งซ้าย: QR Code + Roll Box ด้านล่าง */}
        <View style={styles.qrSection}>
          <View style={styles.qrImageBox}>
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} style={styles.qrImage} />
            ) : (
              <Text style={{ fontSize: 7, color: "#666", textAlign: "center" }}>
                No QR Code
              </Text>
            )}
          </View>
          <View style={styles.qrRollBox}>
            <Text style={styles.qrRollText}>Roll : {rollDisplay}</Text>
          </View>
        </View>

        {/* ฝั่งขวา: ตารางข้อมูล 5 แถว */}
        <View style={styles.tableContainer}>
          {/* แถว 1: Job */}
          <View style={styles.rowNormal}>
            <View style={styles.cellLabel}>
              <Text style={styles.labelText}>Job :</Text>
            </View>
            <View style={styles.cellValue}>
              <Text style={styles.valueText}>{data.job || "-"}</Text>
            </View>
          </View>

          {/* แถว 2: Part No. */}
          <View style={styles.rowNormal}>
            <View style={styles.cellLabel}>
              <Text style={styles.labelText}>Part No. :</Text>
            </View>
            <View style={styles.cellValue}>
              <Text style={styles.valueText}>{data.partNo || "-"}</Text>
            </View>
          </View>

          {/* แถว 3: Description */}
          <View style={styles.rowDesc}>
            <View style={styles.cellLabel}>
              <Text style={styles.labelText}>Description :</Text>
            </View>
            <View style={styles.cellValue}>
              <Text style={styles.descText}>{data.description || "-"}</Text>
            </View>
          </View>

          {/* แถว 4: Lot No. */}
          <View style={styles.rowNormal}>
            <View style={styles.cellLabel}>
              <Text style={styles.labelText}>Lot No. :</Text>
            </View>
            <View style={styles.cellValue}>
              <Text style={styles.valueText}>{data.lotNo || "-"}</Text>
            </View>
          </View>

          {/* แถว 5: Qty */}
          <View style={styles.rowLast}>
            <View style={styles.cellLabel}>
              <Text style={styles.labelText}>Qty :</Text>
            </View>
            <View style={styles.cellValue}>
              <Text style={styles.valueText}>
                {data.qty != null ? `${data.qty} M.` : "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
};

export const JobLabelDocument = ({
  data = null,
  qrCodeUrl = "",
  items = [],
}) => {
  // หากส่ง items แบบ Array มา (เช่น พิมพ์หลายม้วน / หลายสำเนา)
  const labelList =
    items && items.length > 0
      ? items
      : data
        ? [{ data, qrCodeUrl }]
        : [];

  return (
    <Document>
      {labelList.map((item, index) => (
        <SingleLabelPage
          key={index}
          data={item.data || item}
          qrCodeUrl={item.qrCodeUrl || qrCodeUrl}
        />
      ))}
    </Document>
  );
};

export default JobLabelDocument;
