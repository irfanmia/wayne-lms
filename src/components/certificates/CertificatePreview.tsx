'use client';

interface CertificatePreviewProps {
  studentName: string;
  courseName: string;
  date: string;
  instructor: string;
  certificateId: string;
  templateName?: string;
  backgroundImage?: string;
}

export default function CertificatePreview({
  studentName, courseName, date, instructor, certificateId, templateName, backgroundImage
}: CertificatePreviewProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[1.414/1] rounded-xl overflow-hidden shadow-2xl border">
      {/* Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100"
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' } : {}}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
        {/* Header */}
        <div className="mb-2">
          <div className="text-orange-500 text-sm tracking-[0.3em] uppercase font-medium">Certificate of Completion</div>
          <div className="w-24 h-0.5 bg-orange-500 mx-auto mt-2" />
        </div>

        {/* Logo */}
        <div className="text-3xl font-heading font-bold text-gray-800 mt-4 mb-2">
          🎓 Million<span className="text-orange-500">Coders</span>
        </div>

        <p className="text-gray-500 text-sm mb-6">This is to certify that</p>

        {/* Student Name */}
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
          {studentName}
        </h2>

        <p className="text-gray-500 text-sm mb-2">has successfully completed the course</p>

        {/* Course Name */}
        <h3 className="text-xl md:text-2xl font-heading font-semibold text-orange-600 mb-8">
          {courseName}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between w-full max-w-md">
          <div className="text-center">
            <div className="w-32 border-b border-gray-300 mb-1" />
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium">{date}</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-gray-300 mb-1" />
            <p className="text-xs text-gray-500">Instructor</p>
            <p className="text-sm font-medium">{instructor}</p>
          </div>
        </div>

        {/* Certificate ID */}
        <p className="text-xs text-gray-400 mt-6">
          Certificate ID: {certificateId}
        </p>
      </div>
    </div>
  );
}
