"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─────────────────────────────────────────────
// Font
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontSize: 6.5,
    lineHeight: 1.25,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
  },

  // --- Header Styles ---
  headerContainer: {
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerText: {
    fontSize: 7.2,
    lineHeight: 1.4,
  },
  headerLabel: {
    fontWeight: 700,
    fontSize: 7.2,
  },

  // --- Table & Content Box (มีเส้นกรอบซ้าย-ขวาเชื่อมต่อยาวตลอดทั้งหน้า) ---
  tableAndSpaceContainer: {
    flex: 1, // ขยายกินพื้นที่ว่างทั้งหมดระหว่าง Header กับ Footer
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#000",
    marginTop: 4,
    flexDirection: "column",
  },
  table: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#000",
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 1,
    paddingVertical: 1.5,
  },
  headerGroupCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 3,
    backgroundColor: "#FAFAFA",
  },
  headerTextGroup: {
    fontSize: 5.8,
    fontWeight: 700,
    textAlign: "center",
  },
  tableHeaderText: {
    fontSize: 4.8,
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.15,
  },
  cellText: {
    fontSize: 4.5,
    textAlign: "center",
    lineHeight: 1.1,
  },

  // --- Footer & Bottom Styles ---
  footerSection: {
    width: "100%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  summaryRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 22,
    alignItems: "center",
  },
  summaryCol: {
    borderRightWidth: 1,
    borderColor: "#000",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  signatureRow: {
    flexDirection: "row",
    minHeight: 26,
    alignItems: "center",
  },
  signatureCol: {
    width: "33.333%",
    borderRightWidth: 1,
    borderColor: "#000",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});

export const ReportDocument = ({
  header = {},
  machineSetting = {},
  rows = [],
  summary = {},
}) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ================= 1. ส่วนหัวกระดาษ ================= */}
        <View style={styles.headerContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <View style={{ width: "20%" }} />
            <Text style={[styles.title, { width: "60%" }]}>
              รายงานการผลิต EMBOSS
            </Text>
            <View style={{ width: "20%", textAlign: "right" }}>
              <Text style={styles.headerText}>
                <Text style={styles.headerLabel}>วันที่พิมพ์: </Text>
                {header.printDate || new Date().toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 3,
            }}
          >
            <Text style={styles.headerText}>
              <Text style={styles.headerLabel}>Section/แผนก : </Text>
              {header.section || "PE ROLL"}
            </Text>
            <Text style={styles.headerText}>
              <Text style={styles.headerLabel}>JOB No.: </Text>
              {header.jobNo || "-"}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 3,
            }}
          >
            <Text style={styles.headerText}>
              <Text style={styles.headerLabel}>Machine/เครื่องจักร : </Text>
              {header.machine || "Emboss Machine"}
            </Text>
            <Text style={styles.headerText}>
              <Text style={styles.headerLabel}>Production Date/วันที่ผลิต: </Text>
              {header.productionDate || new Date().toLocaleDateString("en-GB")}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 30, marginBottom: 2 }}>
            <Text style={styles.headerText}>
              <Text style={styles.headerLabel}>Part No./รหัสชิ้นงาน : </Text>
              {header.partNo || "-"}
            </Text>
            <Text style={styles.headerText}>
              <Text style={styles.headerLabel}>Part Name/ชื่อชิ้นงาน : </Text>
              {header.description || "-"}
            </Text>
          </View>
        </View>

        {/* ================= 2. ส่วนตารางข้อมูล + เส้นกรอบลากยาวลงมาเชื่อม Footer ================= */}
        <View style={styles.tableAndSpaceContainer}>
          <View style={styles.table}>
            {/* หัวตารางชั้นที่ 1 */}
            <View style={{ flexDirection: "row" }} fixed>
              <View style={[styles.headerGroupCell, { width: "2.0%" }]}>
                <Text style={styles.headerTextGroup}>{"\u00A0"}</Text>
              </View>
              <View style={[styles.headerGroupCell, { width: "36.45%" }]}>
                <Text style={styles.headerTextGroup}>รายละเอียดชิ้นงานที่ผลิต</Text>
              </View>
              <View style={[styles.headerGroupCell, { width: "30.75%" }]}>
                <Text style={styles.headerTextGroup}>รายละเอียดวัตถุดิบที่ใช้ผลิต</Text>
              </View>
              <View
                style={[
                  styles.headerGroupCell,
                  { width: "30.9%", borderRightWidth: 0 },
                ]}
              >
                <Text style={styles.headerTextGroup}>การตั้งค่าเครื่องจักร</Text>
              </View>
            </View>

            {/* หัวตารางชั้นที่ 2 */}
            <View
              style={{
                flexDirection: "row",
                minHeight: 28,
                alignItems: "stretch",
                backgroundColor: "#FAFAFA",
              }}
              fixed
            >
              <View style={[styles.cell, { width: "2.0%" }]}>
                <Text style={styles.tableHeaderText}>No.</Text>
              </View>

              {/* FG Part (36.3%) */}
              <View style={[styles.cell, { width: "5.5%" }]}>
                <Text style={styles.tableHeaderText}>Part No.</Text>
              </View>
              <View style={[styles.cell, { width: "6.4%" }]}>
                <Text style={styles.tableHeaderText}>ชื่อชิ้นงาน</Text>
              </View>
              <View style={[styles.cell, { width: "2.2%" }]}>
                <Text style={styles.tableHeaderText}>สี</Text>
              </View>
              <View style={[styles.cell, { width: "2.0%" }]}>
                <Text style={styles.tableHeaderText}>หนา{"\n"}(mm.)</Text>
              </View>
              <View style={[styles.cell, { width: "2.2%" }]}>
                <Text style={styles.tableHeaderText}>กว้าง{"\n"}(mm.)</Text>
              </View>
              <View style={[styles.cell, { width: "2.0%" }]}>
                <Text style={styles.tableHeaderText}>ยาว{"\n"}(m)</Text>
              </View>
              <View style={[styles.cell, { width: "2.2%" }]}>
                <Text style={styles.tableHeaderText}>งานเสีย{"\n"}(M.)</Text>
              </View>
              <View style={[styles.cell, { width: "5.6%" }]}>
                <Text style={styles.tableHeaderText}>สาเหตุ{"\n"}งานเสีย</Text>
              </View>
              <View style={[styles.cell, { width: "2.0%" }]}>
                <Text style={styles.tableHeaderText}>เริ่ม</Text>
              </View>
              <View style={[styles.cell, { width: "2.0%" }]}>
                <Text style={styles.tableHeaderText}>สิ้นสุด</Text>
              </View>
              <View style={[styles.cell, { width: "4.4%" }]}>
                <Text style={styles.tableHeaderText}>พนักงานผลิต</Text>
              </View>

              {/* SM Part (30.8%) */}
              <View style={[styles.cell, { width: "2.5%" }]}>
                <Text style={styles.tableHeaderText}>วัตถุดิบ</Text>
              </View>
              <View style={[styles.cell, { width: "6.0%" }]}>
                <Text style={styles.tableHeaderText}>Part No.</Text>
              </View>
              <View style={[styles.cell, { width: "9.5%" }]}>
                <Text style={styles.tableHeaderText}>ชื่อวัตถุดิบ</Text>
              </View>
              <View style={[styles.cell, { width: "2.6%" }]}>
                <Text style={styles.tableHeaderText}>จำนวน{"\n"}ที่ใช้</Text>
              </View>
              <View style={[styles.cell, { width: "4.2%" }]}>
                <Text style={styles.tableHeaderText}>Lot</Text>
              </View>
              <View style={[styles.cell, { width: "2.5%" }]}>
                <Text style={styles.tableHeaderText}>Roll</Text>
              </View>
              <View style={[styles.cell, { width: "3.5%" }]}>
                <Text style={styles.tableHeaderText}>Judgment</Text>
              </View>

              {/* Machine Setting (30.9%) */}
              <View style={[styles.cell, { width: "2.6%" }]}>
                <Text style={styles.tableHeaderText}>Speed</Text>
              </View>
              <View style={[styles.cell, { width: "2.8%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}บนซ้าย{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "2.8%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}บนกลาง{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "2.8%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}บนขวา{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "2.8%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}ล่างซ้าย{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "2.8%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}กลางล่าง{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "2.8%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}ล่างขวา{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "3.5%" }]}>
                <Text style={styles.tableHeaderText}>
                  อุณหภูมิ{"\n"}น้ำหล่อเย็น{"\n"}(C)
                </Text>
              </View>
              <View style={[styles.cell, { width: "4.5%" }]}>
                <Text style={styles.tableHeaderText}>
                  การติดกัน{"\n"}ของโฟม{"\n"}กับฟิล์ม
                </Text>
              </View>
              <View
                style={[
                  styles.cell,
                  { width: "3.5%", borderRightWidth: 0 },
                ]}
              >
                <Text style={styles.tableHeaderText}>หมายเหตุ</Text>
              </View>
            </View>

            {/* แถวข้อมูล (Rows) */}
            {rows &&
              rows.map((row, rowIndex) => {
                const smList =
                  row.smMaterials && row.smMaterials.length > 0
                    ? row.smMaterials
                    : [
                        {
                          partNo: "-",
                          name: "-",
                          qtyUsed: "-",
                          lot: "-",
                          rollNumber: "-",
                          judgment: "-",
                        },
                      ];

                const currentMachine = row.machineSetting || machineSetting || {};
                const rowTotalHeight = smList.length * 15;

                return (
                  <View
                    key={rowIndex}
                    wrap={false}
                    style={{
                      flexDirection: "row",
                      minHeight: rowTotalHeight,
                    }}
                  >
                    <View
                      style={[
                        styles.cell,
                        { width: "2.0%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.rollNo ?? rowIndex + 1}
                      </Text>
                    </View>

                    {/* FG Columns (36.3%) */}
                    <View
                      style={[
                        styles.cell,
                        { width: "5.5%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.partNo || header.partNo || "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "6.4%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.description || header.description || "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.2%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.color || header.color || "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.0%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>{row.fgThick ?? "-"}</Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.2%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>{row.fgWidth ?? "-"}</Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.0%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>{row.fgLength ?? "-"}</Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.2%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.fgDefectQty ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "5.6%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.fgDefectCause || "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.0%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.fgStartTime || "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.0%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {row.fgEndTime || "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "4.4%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>{row.operator || "-"}</Text>
                    </View>

                    {/* SM Sub-rows (30.8%) */}
                    <View
                      style={{
                        width: "30.8%",
                        flexDirection: "column",
                        borderRightWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: "#000",
                      }}
                    >
                      {smList.map((sm, smIndex) => (
                        <View
                          key={smIndex}
                          style={{
                            flexDirection: "row",
                            borderTopWidth: smIndex === 0 ? 0 : 0.5,
                            borderColor: "#999",
                            minHeight: 15,
                            alignItems: "stretch",
                          }}
                        >
                          <View
                            style={[
                              styles.cell,
                              { width: "8.12%", borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.cellText}>
                              {sm.rawSeq ?? smIndex + 1}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.cell,
                              { width: "19.48%", borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.cellText}>
                              {sm.partNo || "-"}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.cell,
                              { width: "30.84%", borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.cellText}>{sm.name || "-"}</Text>
                          </View>
                          <View
                            style={[
                              styles.cell,
                              { width: "8.44%", borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.cellText}>
                              {sm.qtyUsed ?? "-"}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.cell,
                              { width: "13.64%", borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.cellText}>{sm.lot || "-"}</Text>
                          </View>
                          <View
                            style={[
                              styles.cell,
                              { width: "8.12%", borderBottomWidth: 0 },
                            ]}
                          >
                            <Text style={styles.cellText}>
                              {sm.rollNumber ?? "-"}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.cell,
                              {
                                width: "11.36%",
                                borderRightWidth: 0,
                                borderBottomWidth: 0,
                              },
                            ]}
                          >
                            <Text style={styles.cellText}>
                              {sm.judgment || "-"}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Machine Setting (30.9%) */}
                    <View
                      style={[
                        styles.cell,
                        { width: "2.6%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.speed ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.8%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.temp1 ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.8%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.temp2 ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.8%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.temp3 ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.8%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.temp4 ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.8%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.temp5 ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "2.8%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.temp6 ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "3.5%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.coolWaterTemp ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        { width: "4.5%", minHeight: rowTotalHeight },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.adhesion ?? "-"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.cell,
                        {
                          width: "3.5%",
                          borderRightWidth: 0,
                          minHeight: rowTotalHeight,
                        },
                      ]}
                    >
                      <Text style={styles.cellText}>
                        {currentMachine.remark || "-"}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>

          {/* พื้นที่ว่างตรงกลางจะรักษาเส้นขอบซ้าย-ขวาไว้เสมอจนถึง Footer */}
        </View>

        {/* ================= 3. ส่วนท้ายเอกสาร (Footer) ================= */}
        <View wrap={false}>
          <View style={styles.footerSection}>
            {/* แถวสรุปยอดการผลิต */}
            <View style={styles.summaryRow}>
              {/* งานเสีย (NG) */}
              <View style={[styles.summaryCol, { width: "36.9%" }]}>
                <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                  งานเสีย (NG) :{" "}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.5,
                    borderColor: "#000",
                    borderStyle: "dotted",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: 14,
                    paddingBottom: 1,
                    marginHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {summary.ngQty ?? ""}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: 700,
                    marginLeft: 4,
                  }}
                >
                  เมตร
                </Text>
              </View>

              {/* รวมงานดี */}
              <View style={[styles.summaryCol, { width: "35.6%" }]}>
                <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                  รวมงานดี :{" "}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.5,
                    borderColor: "#000",
                    borderStyle: "dotted",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: 14,
                    paddingBottom: 1,
                    marginHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {summary.goodQty ?? ""}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: 700,
                    marginLeft: 4,
                  }}
                >
                  เมตร
                </Text>
              </View>

              {/* รวมงานผลิตทั้งหมด */}
              <View
                style={[
                  styles.summaryCol,
                  { width: "27.5%", borderRightWidth: 0 },
                ]}
              >
                <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                  รวมงานผลิตทั้งหมด :{" "}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.5,
                    borderColor: "#000",
                    borderStyle: "dotted",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: 14,
                    paddingBottom: 1,
                    marginHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {summary.totalQty ?? ""}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: 700,
                    marginLeft: 4,
                  }}
                >
                  เมตร
                </Text>
              </View>
            </View>

            {/* แถวเซ็นชื่อ 3 ช่อง */}
            <View style={styles.signatureRow}>
              {/* Operator */}
              <View style={styles.signatureCol}>
                <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                  Operator :{" "}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.5,
                    borderColor: "#000",
                    borderStyle: "dotted",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: 16,
                    paddingBottom: 1,
                    marginHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {summary.operatorSign ?? ""}
                  </Text>
                </View>
              </View>

              {/* Foreman */}
              <View style={styles.signatureCol}>
                <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                  Foreman :{" "}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.5,
                    borderColor: "#000",
                    borderStyle: "dotted",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: 16,
                    paddingBottom: 1,
                    marginHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {summary.foremanSign ?? ""}
                  </Text>
                </View>
              </View>

              {/* Manager */}
              <View style={[styles.signatureCol, { borderRightWidth: 0 }]}>
                <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                  Manager :{" "}
                </Text>
                <View
                  style={{
                    flex: 1,
                    borderBottomWidth: 0.5,
                    borderColor: "#000",
                    borderStyle: "dotted",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: 16,
                    paddingBottom: 1,
                    marginHorizontal: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      textAlign: "center",
                      color: "#000",
                    }}
                  >
                    {summary.managerSign ?? ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReportDocument;