import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Export routine data to Excel format
 */
export const exportToExcel = (routine) => {
    if (!routine) return;

    // Prepare data for Excel
    const data = [];

    // Add header row
    data.push(['Exercise', 'Set #', 'Weight/Time', 'Unit', 'Reps', 'Muscle', 'Body Part']);

    // Group drills by exercise
    const groups = {};
    routine.drills?.forEach(drill => {
        const id = drill.exercise?.refId || 'unknown';
        if (!groups[id]) {
            groups[id] = {
                exerciseName: drill.exercise?.name || 'Unknown Exercise',
                bodyPart: drill.exercise?.bodyPart?.name || '',
                muscle: drill.muscle?.name || drill.exercise?.targetMuscles?.[0]?.name || '',
                drills: []
            };
        }
        groups[id].drills.push(drill);
    });

    // Add data rows
    Object.values(groups).forEach(group => {
        group.drills.forEach((drill, idx) => {
            data.push([
                group.exerciseName,
                idx + 1,
                drill.measurement || '',
                drill.unit || 'kg',
                drill.repetition || '',
                group.muscle,
                group.bodyPart
            ]);
        });
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 25 }, // Exercise
        { wch: 8 },  // Set #
        { wch: 12 }, // Weight/Time
        { wch: 8 },  // Unit
        { wch: 8 },  // Reps
        { wch: 15 }, // Muscle
        { wch: 15 }  // Body Part
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Workout');

    // Generate filename
    const date = new Date(routine.workoutDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).replace(/,/g, '');
    const filename = `${routine.training?.name || 'Workout'}_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
};

/**
 * Export routine data to fillable PDF format
 */
export const exportToPDF = (routine) => {
    if (!routine) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(routine.training?.name || 'Workout Session', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const date = new Date(routine.workoutDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(date, pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Group drills by exercise
    const groups = {};
    routine.drills?.forEach(drill => {
        const id = drill.exercise?.refId || 'unknown';
        if (!groups[id]) {
            groups[id] = {
                exerciseName: drill.exercise?.name || 'Unknown Exercise',
                bodyPart: drill.exercise?.bodyPart?.name || '',
                muscle: drill.muscle?.name || drill.exercise?.targetMuscles?.[0]?.name || '',
                drills: []
            };
        }
        groups[id].drills.push(drill);
    });

    // Add exercises
    Object.values(groups).forEach((group, groupIdx) => {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }

        // Exercise header
        doc.setFillColor(59, 130, 246); // blue-600
        doc.rect(10, yPos - 5, pageWidth - 20, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(group.exerciseName, 15, yPos + 2);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const tags = `${group.muscle} • ${group.bodyPart}`;
        doc.text(tags, pageWidth - 15, yPos + 2, { align: 'right' });

        yPos += 12;

        // Table header
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Done', 15, yPos);
        doc.text('Set', 30, yPos);
        doc.text('Weight/Time', 50, yPos);
        doc.text('Reps', 100, yPos);
        doc.text('Notes', 130, yPos);

        yPos += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(10, yPos, pageWidth - 10, yPos);
        yPos += 5;

        // Add sets with boxes for manual filling
        group.drills.forEach((drill, idx) => {
            if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFont('helvetica', 'normal');

            // Draw checkbox square for completion
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.3);
            doc.rect(12, yPos - 3, 4, 4);

            // Set number
            doc.text(`${idx + 1}`, 30, yPos);

            // Weight/Time box
            doc.setDrawColor(180, 180, 180);
            doc.rect(50, yPos - 4, 40, 6);
            if (drill.measurement) {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(`${drill.measurement} ${drill.unit}`, 52, yPos + 1);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(8);
            }

            // Reps box
            doc.rect(100, yPos - 4, 20, 6);
            if (drill.repetition) {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(`${drill.repetition}`, 102, yPos + 1);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(8);
            }

            // Notes box
            doc.rect(130, yPos - 4, 65, 6);

            yPos += 8;
        });

        yPos += 5;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Leximentor Fitmate - Print and fill during workout', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Generate filename
    const dateStr = new Date(routine.workoutDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).replace(/,/g, '');
    const filename = `${routine.training?.name || 'Workout'}_${dateStr}.pdf`;

    // Save PDF
    doc.save(filename);
};
