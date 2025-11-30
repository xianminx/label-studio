import { useContext } from "react";
import { Toggle, Typography } from "@humansignal/ui";
import { ProjectContext } from "../../providers/ProjectProvider";
import { useAPI } from "@humansignal/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./settings.scss";

export const ContributorsSettings = () => {
  const { project } = useContext(ProjectContext);
  const api = useAPI();
  const queryClient = useQueryClient();

  // Fetch contributors list using React Query
  const { data: contributors = [], isLoading, isError } = useQuery({
    queryKey: ["projectContributors", project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      
      const response = await api.callApi("projectContributors", {
        params: {
          pk: project.id,
        },
      });
      return response || [];
    },
    enabled: !!project?.id,
  });

  // Mutation for toggling contributor access
  const toggleMutation = useMutation({
    mutationFn: async ({ userId, enabled }) => {
      return api.callApi("updateProjectContributor", {
        params: {
          pk: project.id,
        },
        body: {
          id: userId,
          enabled: enabled,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch contributors list
      queryClient.invalidateQueries({ queryKey: ["projectContributors", project?.id] });
    },
    onError: (error) => {
      console.error("Failed to update contributor:", error);
    },
  });

  const handleToggle = (userId, currentEnabled) => {
    toggleMutation.mutate({ userId, enabled: !currentEnabled });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-4 text-[#1f1f1f]">Contributors</h1>
          <Typography>Loading contributors...</Typography>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-4xl">
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-4 text-[#1f1f1f]">Contributors</h1>
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <Typography className="text-red-600">Failed to load contributors. Please try again.</Typography>
          </div>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="p-6">
          <h1 className="text-2xl font-medium mb-4 text-[#1f1f1f]">Contributors</h1>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Typography>No contributors found in your organization.</Typography>
            <Typography size="small" className="mt-2 text-gray-500">
              Contributors are users with the "Contributor" role. They can only access projects assigned to them.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="p-6">
        <h1 className="text-2xl font-medium mb-2 text-[#1f1f1f]">Contributors</h1>
        <Typography className="mb-6 text-gray-600">
          Manage which contributors have access to this project.
        </Typography>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider">Email</th>
                <th className="py-3 px-6 font-medium text-gray-600 text-sm uppercase tracking-wider text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contributors.map((contributor) => (
                <tr key={contributor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-800 font-medium">{contributor.email}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                       <span className={`text-sm ${contributor.enabled ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        {contributor.enabled ? 'Active' : 'Inactive'}
                      </span>
                      <Toggle
                        checked={contributor.enabled}
                        onChange={() => handleToggle(contributor.id, contributor.enabled)}
                        disabled={toggleMutation.isPending}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

ContributorsSettings.menuItem = "Contributors";
ContributorsSettings.path = "/contributors";
ContributorsSettings.exact = true;
