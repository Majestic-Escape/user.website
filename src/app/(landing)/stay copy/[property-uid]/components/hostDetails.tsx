import MediaImage from "@/components/ui/media-image";
import { BadgeCheck, Calendar, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { hostData } from "@/lib/data";

export default function HostInformation({
  hostData,
}: {
  hostData: {
    name: string;
    profileImage: string;
    isVerified: boolean;
    rating: {
      average: number;
      total: number;
    };
    reviews: number;
    stays: number;
    description: string;
    joinDate: string;
    responseRate: number;
    responseTime: string;
  };
}) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "fill-yellow-400" : "fill-gray-300"
        }`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ));
  };

  return (
    <div className="pt-4">
      <div className="max-w-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Host Information</h2>
        <hr className="sm:w-[100px] w-[200px] mb-6 border-gray-200" />

        <div className="flex items-center mb-4">
          <MediaImage
            src={hostData.profileImage || ""}
            alt={hostData.name || ""}
            width={56}
            height={56}
            className="rounded-full mr-4"
          />
          <div>
            <div className="flex items-center">
              <h3 className="text-xl mr-2">{hostData.name || ""}</h3>
              {hostData.isVerified && (
                <BadgeCheck className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="flex mr-1">
                  {renderStars(hostData.rating.average)}
                </div>
                <span className="font-bold">
                  {hostData.rating.average.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>({hostData.rating.total} reviews)</span>
                <span className="hidden sm:inline">·</span>
                <span>{hostData.stays} stays</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#6B7280] mb-4">{hostData.description}</p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-[#6B7280]">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Joined in {hostData.joinDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Response rate - {hostData.responseRate}%</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Fast response - {hostData.responseTime}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="bg-white text-[#46921E] px-[25px] py-[20px] rounded-full green-border"
        >
          See host profile
        </Button>
      </div>
    </div>
  );
}
