import { UserResource } from "@clerk/types";

const ProfileHeader = ({ user }: { user: UserResource | null | undefined }) => {
  const imageUrl = user?.imageUrl || "";
  const fullName = user?.fullName || "Guest Athlete";
  const emailAddress = user?.primaryEmailAddress?.emailAddress || "guest@fitbuddy.ai";

  return (
    <div className="mb-10 relative backdrop-blur-md border border-border/30 rounded-2xl p-6 bg-card/40">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          {imageUrl ? (
            <div className="relative w-24 h-24 overflow-hidden rounded-2xl border-2 border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <img
                src={imageUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border/20">
              <span className="text-3xl font-bold text-primary font-mono">
                {fullName.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-green-500 border-4 border-slate-900 animate-pulse"></div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {fullName}
              </h1>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                {emailAddress}
              </p>
            </div>
            <div className="inline-flex items-center bg-slate-900/60 backdrop-blur-sm border border-border/35 rounded-full px-4 py-1.5 font-mono text-xs text-primary self-start">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></div>
              <span>COACH CONNECTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileHeader;
