import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Download, Plus } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Marks, Student } from "@/types";
import { Appbar } from "@/components/appbar";
import { useNavigation } from "@/navigation";
import { MarksList } from "@/components/marks";
import { Dropdown } from "@/components/Dropdown";
import { useUserStore } from "@/stores/userStore";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { SubjectWithClass } from "@/services/subjects";
import { MarksService, SubjectsService, StudentsService } from "@/services";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MarksPage() {
  const { user } = useUserStore();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [subjectsWithClass, setSubjectsWithClass] = useState<
    SubjectWithClass[]
  >([]);
  const [subjectMarksData, setSubjectMarksData] = useState<Marks[]>([]);
  const [selectedSubjectWithClass, setSelectedSubjectWithClass] =
    useState<SubjectWithClass | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubjectWithClass) {
      loadSubjectMarksData();
    }
  }, [selectedSubjectWithClass]);

  // Refresh marks data when screen comes into focus (e.g., after adding/editing marks)
  useFocusEffect(
    useCallback(() => {
      if (selectedSubjectWithClass && selectedMonth) {
        loadSubjectMarksData();
      }
    }, [selectedSubjectWithClass, selectedMonth]),
  );

  const loadSubjects = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const [subjectsWithClassData, allStudents] = await Promise.all([
        SubjectsService.getSubjectsWithClassForTeacher(user.id),
        StudentsService.getAllStudents(),
      ]);
      setSubjectsWithClass(subjectsWithClassData);
      setStudents(allStudents);
      if (subjectsWithClassData.length > 0) {
        setSelectedSubjectWithClass(subjectsWithClassData[0]);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      showAlert({
        title: "Error",
        message: "Failed to load subjects",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectMarksData = async () => {
    if (!selectedSubjectWithClass) return;

    try {
      const allMarks = await MarksService.getSubjectMarksByClass(
        selectedSubjectWithClass.subject.id,
        selectedSubjectWithClass.class.id,
      );
      setSubjectMarksData(allMarks);
      if (allMarks.length > 0 && !selectedMonth) {
        setSelectedMonth(allMarks[0].month);
      }
    } catch (error) {
      console.error("Error loading class marks data:", error);
      showAlert({
        title: "Error",
        message: "Failed to load class data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading marks...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <Appbar showBack={true} title="Student Marks" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Dropdown
            placeholder="Select Subject & Class"
            options={subjectsWithClass.map(subjectWithClass => ({
              id: subjectWithClass.assignmentId,
              label: `${subjectWithClass.subject.name} - ${subjectWithClass.class.name} (${subjectWithClass.class.grade}${subjectWithClass.class.section})`,
              value: subjectWithClass.assignmentId,
            }))}
            selectedValue={selectedSubjectWithClass?.assignmentId}
            onSelect={option => {
              const selected = subjectsWithClass.find(
                s => s.assignmentId === option.value,
              );
              setSelectedSubjectWithClass(selected || null);
            }}
          />
          <Dropdown
            placeholder="Select Month"
            options={months.map(month => ({
              id: month,
              label: month,
              value: month,
            }))}
            selectedValue={selectedMonth}
            onSelect={option => {
              setSelectedMonth(option.value);
            }}
          />

          {/* Marks List */}
          {selectedMonth && (
            <MarksList
              marks={subjectMarksData.filter(
                mark => mark.month === selectedMonth,
              )}
              students={students}
              onEditMarks={() => {
                if (selectedSubjectWithClass && selectedMonth) {
                  navigation.navigate("AddEditMarks", {
                    mode: "edit",
                    subjectId: selectedSubjectWithClass.subject.id,
                    classId: selectedSubjectWithClass.class.id,
                    month: selectedMonth,
                  });
                }
              }}
            />
          )}

          {/* Action Buttons */}
          {selectedSubjectWithClass && selectedMonth && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Download size={24} color={colors.onPrimary} />
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                  Download
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    borderWidth: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  if (selectedSubjectWithClass && selectedMonth) {
                    navigation.navigate("AddEditMarks", {
                      mode: "add",
                      subjectId: selectedSubjectWithClass.subject.id,
                      classId: selectedSubjectWithClass.class.id,
                      month: selectedMonth,
                    });
                  } else {
                    showAlert({
                      title: "Selection Required",
                      message:
                        "Please select both subject and month before adding marks",
                      type: "warning",
                    });
                  }
                }}
              >
                <Plus size={24} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Add Marks
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },

  button: {
    padding: 12,
    borderRadius: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
});
