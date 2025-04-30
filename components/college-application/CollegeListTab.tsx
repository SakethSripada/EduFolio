"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2, Star, StarOff, Loader2, FileText } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { handleSupabaseError } from "@/lib/supabase"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { validateRequired } from "@/lib/validation"
import { performDatabaseOperation } from "@/lib/utils"
import { RequiredLabel } from "@/components/ui/required-label"
import { FormErrorSummary } from "@/components/ui/form-error-summary"
import { NumericInput } from "@/components/ui/numeric-input"

type College = {
  id: string
  name: string
  location: string
  type: string
  size: string
  acceptance_rate: number
  ranking: number
  tuition: number
  logo_url: string
  website_url?: string
}

type UserCollege = {
  id: string
  user_id: string
  college_id: string
  application_status: string
  application_deadline?: string | null
  application_deadline_display?: string | null
  is_reach: boolean
  is_target: boolean
  is_safety: boolean
  is_favorite: boolean
  notes?: string | null
  college: College
}

export default function CollegeListTab() {
  const [colleges, setColleges] = useState<College[]>([])
  const [userColleges, setUserColleges] = useState<UserCollege[]>([])
  const [isAddingCollege, setIsAddingCollege] = useState(false)
  const [isEditingCollege, setIsEditingCollege] = useState(false)
  const [editingCollegeId, setEditingCollegeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formSubmitted, setFormSubmitted] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("")
  const [selectedColleges, setSelectedColleges] = useState<string[]>([])
  
  // New filter state variables
  const [acceptanceRateFilter, setAcceptanceRateFilter] = useState<[number | null, number | null]>([0, 100])
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [rankingFilter, setRankingFilter] = useState<[number | null, number | null]>([1, 300])
  const [sizeFilter, setSizeFilter] = useState<string>("All")
  const [tuitionFilter, setTuitionFilter] = useState<[number | null, number | null]>([0, 70000])
  const [regionFilter, setRegionFilter] = useState<string>("All")
  const [showFilters, setShowFilters] = useState(false)

  const [newUserCollege, setNewUserCollege] = useState({
    college_id: "",
    application_status: "Researching",
    application_deadline_display: "",
    is_reach: false,
    is_target: false,
    is_safety: false,
    is_favorite: false,
    notes: "",
  })

  // Add state for confirmation dialog
  const [confirmDeleteCollege, setConfirmDeleteCollege] = useState<string | null>(null)

  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20 // Number of colleges to show per page

  // Define regions with their states
  const regions = {
    "All": [],
    "Northeast": ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
    "Midwest": ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
    "South": ["DE", "MD", "DC", "VA", "WV", "NC", "SC", "GA", "FL", "KY", "TN", "AL", "MS", "AR", "LA", "OK", "TX"],
    "West": ["MT", "ID", "WY", "CO", "NM", "AZ", "UT", "NV", "WA", "OR", "CA", "AK", "HI"]
  };

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // 1) Load all colleges
        const { data: collegesData, error: collegesError } = await supabase
          .from("colleges")
          .select("*")
          .order("name", { ascending: true })
        if (collegesError) throw collegesError
        setColleges(collegesData || [])

        // 2) Load this user’s colleges
        const { data: userCollegesData, error: userCollegesError } = await supabase
          .from("user_colleges")
          .select(`*, college:colleges(*)`)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        if (userCollegesError) throw userCollegesError
        setUserColleges(userCollegesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error fetching data",
          description: handleSupabaseError(
            error,
            "There was a problem loading your college list."
          ),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])


  // Validate college form
  const validateCollegeForm = (): boolean => {
    const errors: Record<string, string> = {}

    const collegeIdError = validateRequired(newUserCollege.college_id, "College")
    if (collegeIdError) errors.college_id = collegeIdError

    const statusError = validateRequired(newUserCollege.application_status, "Application status")
    if (statusError) errors.application_status = statusError

    // Validate that at least one category is selected
    if (!newUserCollege.is_reach && !newUserCollege.is_target && !newUserCollege.is_safety) {
      errors.category = "Please select at least one category (Reach, Target, or Safety)"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Memoize filtered colleges to avoid recalculating on every render
  const filteredCollegesForSelection = useMemo(() => {
    return colleges.filter((college) => {
      // Text search filter
      const matchesText = !collegeSearchQuery || 
        college.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
        college.location.toLowerCase().includes(collegeSearchQuery.toLowerCase());
        
      // Acceptance rate filter (convert decimal to percentage for comparison)
      const acceptanceRatePercent = college.acceptance_rate * 100;
      const matchesAcceptanceRate = 
        (acceptanceRateFilter[0] === null || acceptanceRatePercent >= acceptanceRateFilter[0]) && 
        (acceptanceRateFilter[1] === null || acceptanceRatePercent <= acceptanceRateFilter[1]);
      
      // Type filter
      const matchesType = typeFilter === "All" || college.type === typeFilter;
      
      // Size filter
      const matchesSize = sizeFilter === "All" || college.size === sizeFilter;
      
      // Ranking filter
      const matchesRanking = 
        (rankingFilter[0] === null || college.ranking >= rankingFilter[0]) && 
        (rankingFilter[1] === null || college.ranking <= rankingFilter[1]);
        
      // Tuition filter
      const matchesTuition = 
        (tuitionFilter[0] === null || college.tuition >= tuitionFilter[0]) && 
        (tuitionFilter[1] === null || college.tuition <= tuitionFilter[1]);
        
      // Region filter
      const matchesRegion = regionFilter === "All" || 
        (regions[regionFilter as keyof typeof regions] as string[]).some(state => 
          college.location.endsWith(`, ${state}`)
        );
      
      return matchesText && matchesAcceptanceRate && matchesType && matchesSize && matchesRanking && matchesTuition && matchesRegion;
    });
  }, [colleges, collegeSearchQuery, acceptanceRateFilter, typeFilter, sizeFilter, rankingFilter, tuitionFilter, regionFilter, regions]);

  // Function to check if a college is already in the user's list
  const isCollegeInUserList = useCallback((collegeId: string): boolean => {
    return userColleges.some(userCollege => userCollege.college_id === collegeId);
  }, [userColleges]);

  // Clear all selected colleges
  const clearSelectedColleges = useCallback((): void => {
    setSelectedColleges([]);
    toast({
      title: "Selection cleared",
      description: "All selected colleges have been cleared."
    });
  }, [toast]);

  // Get paginated college data
  const paginatedColleges = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCollegesForSelection.slice(startIndex, startIndex + pageSize);
  }, [filteredCollegesForSelection, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCollegesForSelection.length / pageSize);
  }, [filteredCollegesForSelection.length, pageSize]);

  // Toggle selection of a college - memoized for performance
  const toggleCollegeSelection = useCallback((collegeId: string) => {
    setSelectedColleges((prev) => {
      if (prev.includes(collegeId)) {
        return prev.filter((id) => id !== collegeId);
      } else {
        return [...prev, collegeId];
      }
    });
  }, []);

  // Handle page change
  const changePage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // Add multiple selected colleges
  const addSelectedColleges = async () => {
    if (selectedColleges.length === 0) {
      toast({
        title: "No colleges selected",
        description: "Please select at least one college to add.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add each selected college
      for (const collegeId of selectedColleges) {
        const selectedCollege = colleges.find((c) => c.id === collegeId);
        if (!selectedCollege) continue;

        // Check if college is already in user's list
        const { data: existingCollege, error: checkError } = await supabase
          .from("user_colleges")
          .select("id")
          .eq("user_id", user?.id)
          .eq("college_id", collegeId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingCollege) {
          toast({
            title: "College already in list",
            description: `${selectedCollege.name} is already in your list.`,
            variant: "destructive",
          });
          continue;
        }

        // Add college to user's list
        const { error } = await supabase.from("user_colleges").insert([
          {
            user_id: user?.id,
            college_id: collegeId,
            application_status: "Researching",
            is_reach: selectedCollege.acceptance_rate < 0.15,
            is_target: selectedCollege.acceptance_rate >= 0.15 && selectedCollege.acceptance_rate < 0.35,
            is_safety: selectedCollege.acceptance_rate >= 0.35,
            is_favorite: false,
          },
        ]);

        if (error) throw error;
      }

      // Refresh user's colleges
      const { data: userCollegesData, error: userCollegesError } = await supabase
        .from("user_colleges")
        .select(`
          *,
          college:colleges(*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (userCollegesError) throw userCollegesError;

      setUserColleges(userCollegesData || []);
      setSelectedColleges([]);
      setIsAddingCollege(false);

      toast({
        title: "Colleges added",
        description: `Added ${selectedColleges.length} college(s) to your list.`,
      });
    } catch (error) {
      toast({
        title: "Error adding colleges",
        description: handleSupabaseError(error, "There was a problem adding the colleges to your list."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditCollege = (userCollegeId: string) => {
    const userCollegeToEdit = userColleges.find((uc) => uc.id === userCollegeId)
    if (userCollegeToEdit) {
      setNewUserCollege({
        college_id: userCollegeToEdit.college_id,
        application_status: userCollegeToEdit.application_status,
        application_deadline_display: userCollegeToEdit.application_deadline_display || "",
        is_reach: userCollegeToEdit.is_reach,
        is_target: userCollegeToEdit.is_target,
        is_safety: userCollegeToEdit.is_safety,
        is_favorite: userCollegeToEdit.is_favorite,
        notes: userCollegeToEdit.notes || "",
      })
      setEditingCollegeId(userCollegeId)
      setIsEditingCollege(true)
    }
  }

  // Add a single college to user's list with validation
  const addCollegeToUserList = async (collegeId: string) => {
    if (!user) return;
    
    setFormSubmitted(true);
    
    // Set the selected college ID
    setNewUserCollege(prev => ({ ...prev, college_id: collegeId }));
    
    if (!validateCollegeForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const selectedCollege = colleges.find((c) => c.id === collegeId);
      if (!selectedCollege) return;
      
      // Check if college is already in user's list
      const { data: existingCollege, error: checkError } = await supabase
        .from("user_colleges")
        .select("id")
        .eq("user_id", user.id)
        .eq("college_id", collegeId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingCollege) {
        toast({
          title: "College already in list",
          description: `${selectedCollege.name} is already in your list.`,
          variant: "destructive",
        });
        return;
      }
      
      // Add college to user's list
      const { error } = await supabase.from("user_colleges").insert([
        {
          user_id: user.id,
          college_id: collegeId,
          application_status: newUserCollege.application_status,
          is_reach: newUserCollege.is_reach,
          is_target: newUserCollege.is_target,
          is_safety: newUserCollege.is_safety,
          is_favorite: newUserCollege.is_favorite,
          notes: newUserCollege.notes || null,
          application_deadline_display: newUserCollege.application_deadline_display || null,
        },
      ]);
      
      if (error) throw error;
      
      // Refresh user's colleges
      const { data: userCollegesData, error: userCollegesError } = await supabase
        .from("user_colleges")
        .select(`
          *,
          college:colleges(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (userCollegesError) throw userCollegesError;
      
      setUserColleges(userCollegesData || []);
      setIsAddingCollege(false);
      setFormSubmitted(false);
      setNewUserCollege({
        college_id: "",
        application_status: "Researching",
        application_deadline_display: "",
        is_reach: false,
        is_target: false,
        is_safety: false,
        is_favorite: false,
        notes: "",
      });
      
      toast({
        title: "College added",
        description: `${selectedCollege.name} has been added to your list.`,
      });
    } catch (error) {
      toast({
        title: "Error adding college",
        description: handleSupabaseError(error, "There was a problem adding the college to your list."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCollege = async () => {
    if (!user || !editingCollegeId) return
    
    setFormSubmitted(true)
    
    if (!validateCollegeForm()) {
      return
    }

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("user_colleges")
          .update({
            application_status: newUserCollege.application_status,
            application_deadline_display: newUserCollege.application_deadline_display || null,
            is_reach: newUserCollege.is_reach,
            is_target: newUserCollege.is_target,
            is_safety: newUserCollege.is_safety,
            is_favorite: newUserCollege.is_favorite,
            notes: newUserCollege.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCollegeId)

        if (error) throw error

        // Fetch the updated record with college details
        const { data: updatedData, error: fetchError } = await supabase
          .from("user_colleges")
          .select(`
            *,
            college:colleges(*)
          `)
          .eq("id", editingCollegeId)
          .maybeSingle()

        if (fetchError) throw fetchError

        return updatedData
      },
      setIsLoading,
      (updatedData) => {
        setUserColleges(
          userColleges.map((userCollege) => {
            if (userCollege.id === editingCollegeId) {
              return updatedData
            }
            return userCollege
          }),
        )
        setNewUserCollege({
          college_id: "",
          application_status: "Researching",
          application_deadline_display: "",
          is_reach: false,
          is_target: false,
          is_safety: false,
          is_favorite: false,
          notes: "",
        })
        setIsEditingCollege(false)
        setEditingCollegeId(null)
        setFormErrors({})
        setFormSubmitted(false)

        toast({
          title: "College updated",
          description: "Your college information has been updated successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error updating college",
          description: handleSupabaseError(error, "There was a problem updating the college information."),
          variant: "destructive",
        })
      },
    )
  }

  const toggleFavorite = async (userCollegeId: string) => {
    const userCollegeToToggle = userColleges.find((uc) => uc.id === userCollegeId)
    if (!userCollegeToToggle || !user) return

    const newFavoriteState = !userCollegeToToggle.is_favorite

    await performDatabaseOperation(
      async () => {
        const { error } = await supabase
          .from("user_colleges")
          .update({
            is_favorite: newFavoriteState,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userCollegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setUserColleges(
          userColleges.map((userCollege) => {
            if (userCollege.id === userCollegeId) {
              return {
                ...userCollege,
                is_favorite: newFavoriteState,
              }
            }
            return userCollege
          }),
        )

        toast({
          title: newFavoriteState ? "College favorited" : "College unfavorited",
          description: `The college has been ${newFavoriteState ? "added to" : "removed from"} your favorites.`,
        })
      },
      (error) => {
        toast({
          title: "Error updating college",
          description: handleSupabaseError(error, "There was a problem updating the college information."),
          variant: "destructive",
        })
      },
    )
  }

  const deleteCollege = async (userCollegeId: string) => {
    if (!user) return

    await performDatabaseOperation(
      async () => {
        // Delete college-specific data first
        const userCollege = userColleges.find((uc) => uc.id === userCollegeId)
        if (!userCollege) throw new Error("College not found")

        // Delete college courses
        await supabase.from("college_courses").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Delete college extracurricular activities
        await supabase
          .from("college_extracurricular_activities")
          .delete()
          .eq("user_id", user.id)
          .eq("college_id", userCollege.college_id)

        // Delete college awards
        await supabase.from("college_awards").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Delete college essays
        await supabase.from("college_essays").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Delete college todos
        await supabase.from("college_todos").delete().eq("user_id", user.id).eq("college_id", userCollege.college_id)

        // Finally delete the user college entry
        const { error } = await supabase.from("user_colleges").delete().eq("id", userCollegeId)

        if (error) throw error
        return { success: true }
      },
      setIsLoading,
      () => {
        setUserColleges(userColleges.filter((userCollege) => userCollege.id !== userCollegeId))
        setConfirmDeleteCollege(null)

        toast({
          title: "College removed",
          description: "The college has been removed from your list successfully.",
        })
      },
      (error) => {
        toast({
          title: "Error removing college",
          description: handleSupabaseError(error, "There was a problem removing the college from your list."),
          variant: "destructive",
        })
      },
    )
  }

  const navigateToCollegeApplication = (collegeId: string, collegeName: string) => {
    // Store the selected college in localStorage for persistence
    localStorage.setItem("selectedCollegeId", collegeId)
    localStorage.setItem("selectedCollegeName", collegeName)

    // Navigate to the college application page
    window.location.href = `/college-application/college/${collegeId}`
  }

  // Filter colleges based on active tab and search query
  const filteredColleges = userColleges.filter((userCollege) => {
    // First filter by tab
    let passesTabFilter = false;
    if (activeTab === "all") passesTabFilter = true;
    else if (activeTab === "favorites") passesTabFilter = userCollege.is_favorite;
    else if (activeTab === "reach") passesTabFilter = userCollege.is_reach;
    else if (activeTab === "target") passesTabFilter = userCollege.is_target;
    else if (activeTab === "safety") passesTabFilter = userCollege.is_safety;
    else if (activeTab === userCollege.application_status.toLowerCase()) passesTabFilter = true;
    
    // If doesn't pass tab filter, return false immediately
    if (!passesTabFilter) return false;
    
    // Then filter by search query
    if (!searchQuery) return true;
    
    // Search in college name and location
    return (
      userCollege.college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userCollege.college.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Researching":
        return <Badge variant="outline">Researching</Badge>
      case "Applying":
        return <Badge className="bg-blue-500">Applying</Badge>
      case "Applied":
        return <Badge className="bg-purple-500">Applied</Badge>
      case "Waitlisted":
        return <Badge className="bg-yellow-500">Waitlisted</Badge>
      case "Accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "Committed":
        return <Badge className="bg-primary">Committed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Reset all filters to default values
  const resetAllFilters = () => {
    setCollegeSearchQuery("");
    setAcceptanceRateFilter([0, 100]);
    setTypeFilter("All");
    setRankingFilter([1, 300]);
    setSizeFilter("All");
    setTuitionFilter([0, 70000]);
    setRegionFilter("All");
  };

  // Replace the existing colleges table in the add college dialog with this optimized version
  const renderCollegeTable = () => {
    return (
      <div className="border rounded-md max-h-[300px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>College</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Acceptance Rate</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Tuition ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedColleges.length > 0 ? (
              paginatedColleges.map((college) => {
                const alreadyAdded = isCollegeInUserList(college.id);
                return (
                  <TableRow 
                    key={college.id}
                    className={`
                      ${selectedColleges.includes(college.id) ? "bg-muted" : ""}
                      ${alreadyAdded ? "opacity-50" : ""}
                    `}
                    onClick={() => !alreadyAdded && toggleCollegeSelection(college.id)}
                    style={{ cursor: alreadyAdded ? "not-allowed" : "pointer" }}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedColleges.includes(college.id)}
                        disabled={alreadyAdded}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell>
                      {college.name}
                      {alreadyAdded && <span className="ml-2 text-xs text-muted-foreground">(Already added)</span>}
                    </TableCell>
                    <TableCell>{college.location}</TableCell>
                    <TableCell>{college.type}</TableCell>
                    <TableCell>{college.size}</TableCell>
                    <TableCell>{(college.acceptance_rate * 100).toFixed(1)}%</TableCell>
                    <TableCell>{college.ranking}</TableCell>
                    <TableCell>${college.tuition.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No colleges match your filters. Try adjusting your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Add pagination controls for the college list
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center gap-1 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-1 mx-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show at most 5 page buttons
            let pageNum = currentPage;
            if (currentPage <= 3) {
              // If we're near the start, show pages 1-5
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // If we're near the end, show the last 5 pages
              pageNum = totalPages - 4 + i;
            } else {
              // Otherwise show currentPage-2 to currentPage+2
              pageNum = currentPage - 2 + i;
            }
            
            // Make sure pageNum is within bounds
            if (pageNum <= 0 || pageNum > totalPages) return null;
            
            return (
              <Button 
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"} 
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => changePage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="mx-1">...</span>
              <Button 
                variant="outline" 
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => changePage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (isLoading && userColleges.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold">My College List</h2>
        <Button className="flex items-center gap-1" onClick={() => setIsAddingCollege(true)}>
          <PlusCircle className="h-4 w-4" /> Add College
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All Colleges</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reach">Reach</TabsTrigger>
            <TabsTrigger value="target">Target</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="researching">Researching</TabsTrigger>
            <TabsTrigger value="applying">Applying</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="waitlisted">Waitlisted</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
          </TabsList>
          
          <Input
            placeholder="Search colleges..."
            className="w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {filteredColleges.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 border rounded-md">
              No colleges found. Add a college to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
              {filteredColleges.map((userCollege) => (
                <div 
                  key={userCollege.id} 
                  className="flex flex-col bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full relative"
                >
                  {/* Card Header with Logo and Favorite Button */}
                  <div className="relative h-32 bg-muted/50 flex items-center justify-center p-4 border-b">
                    {userCollege.college.logo_url ? (
                      <img 
                        src={userCollege.college.logo_url} 
                        alt={`${userCollege.college.name} logo`} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-center text-muted-foreground">
                        {userCollege.college.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-background/70 backdrop-blur-sm hover:bg-background rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(userCollege.id);
                      }}
                      title={userCollege.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {userCollege.is_favorite ? (
                        <Star className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex flex-col flex-grow p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{userCollege.college.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{userCollege.college.location}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="mt-1">{getStatusBadge(userCollege.application_status)}</div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Deadline</p>
                        <p className="text-sm truncate">{userCollege.application_deadline_display || "Not set"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <div className="flex flex-wrap gap-1">
                        {userCollege.is_reach && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                            Reach
                          </Badge>
                        )}
                        {userCollege.is_target && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                            Target
                          </Badge>
                        )}
                        {userCollege.is_safety && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Safety
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Notes Preview - optional */}
                    {userCollege.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm line-clamp-2">{userCollege.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-3 border-t flex justify-between items-center">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditCollege(userCollege.id);
                          }}
                          title="Edit college"
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteCollege(userCollege.id);
                          }}
                          title="Remove college"
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToCollegeApplication(userCollege.college_id, userCollege.college.name)}
                        title="View college application"
                        className="ml-auto"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Application
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add College Dialog */}
      <Dialog open={isAddingCollege} onOpenChange={(isOpen) => {
        // Reset pagination when opening/closing dialog
        if (!isOpen) {
          setCurrentPage(1);
        }
        setIsAddingCollege(isOpen);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Colleges to Your List</DialogTitle>
          </DialogHeader>
          
          <FormErrorSummary errors={formErrors} show={formSubmitted} />
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="college-search">Search Colleges</RequiredLabel>
              <Input
                id="college-search"
                placeholder="Search by name or location..."
                value={collegeSearchQuery}
                onChange={(e) => {
                  setCollegeSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when search changes
                }}
                className="mb-2"
              />
              
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(prev => !prev)}
                  className="mb-2"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                
                {showFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetAllFilters();
                      setCurrentPage(1); // Reset to first page when filters reset
                    }}
                    className="mb-2"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
              
              {showFilters && (
                <div className="border rounded-md p-4 mb-4 bg-muted/30">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type-filter" className="text-sm font-medium mb-1 block">Institution Type</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger id="type-filter">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="Public">Public</SelectItem>
                            <SelectItem value="Private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="size-filter" className="text-sm font-medium mb-1 block">Institution Size</Label>
                        <Select value={sizeFilter} onValueChange={setSizeFilter}>
                          <SelectTrigger id="size-filter">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Sizes</SelectItem>
                            <SelectItem value="Small">Small</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="region-filter" className="text-sm font-medium mb-1 block">Region</Label>
                      <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger id="region-filter">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Regions</SelectItem>
                          <SelectItem value="Northeast">Northeast</SelectItem>
                          <SelectItem value="Midwest">Midwest</SelectItem>
                          <SelectItem value="South">South</SelectItem>
                          <SelectItem value="West">West</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Acceptance Rate: {acceptanceRateFilter[0] !== null ? acceptanceRateFilter[0] : 'Any'}% - {acceptanceRateFilter[1] !== null ? acceptanceRateFilter[1] : 'Any'}%
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-rate" className="text-xs">Min (%)</Label>
                          <NumericInput
                            id="min-rate"
                            min={0}
                            max={100}
                            value={acceptanceRateFilter[0]}
                            onChange={(value) => {
                              setAcceptanceRateFilter([value, acceptanceRateFilter[1]]);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-rate" className="text-xs">Max (%)</Label>
                          <NumericInput
                            id="max-rate"
                            min={0}
                            max={100}
                            value={acceptanceRateFilter[1]}
                            onChange={(value) => {
                              setAcceptanceRateFilter([acceptanceRateFilter[0], value]);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Ranking: {rankingFilter[0] !== null ? rankingFilter[0] : 'Any'} - {rankingFilter[1] !== null ? rankingFilter[1] : 'Any'}
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-rank" className="text-xs">Min Rank</Label>
                          <NumericInput
                            id="min-rank"
                            min={1}
                            value={rankingFilter[0]}
                            onChange={(value) => {
                              setRankingFilter([value, rankingFilter[1]]);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-rank" className="text-xs">Max Rank</Label>
                          <NumericInput
                            id="max-rank"
                            min={1}
                            value={rankingFilter[1]}
                            onChange={(value) => {
                              setRankingFilter([rankingFilter[0], value]);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Tuition: ${tuitionFilter[0] !== null ? tuitionFilter[0]?.toLocaleString() : 'Any'} - ${tuitionFilter[1] !== null ? tuitionFilter[1]?.toLocaleString() : 'Any'}
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-tuition" className="text-xs">Min Tuition ($)</Label>
                          <NumericInput
                            id="min-tuition"
                            min={0}
                            value={tuitionFilter[0]}
                            onChange={(value) => {
                              setTuitionFilter([value, tuitionFilter[1]]);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-tuition" className="text-xs">Max Tuition ($)</Label>
                          <NumericInput
                            id="max-tuition"
                            min={0}
                            value={tuitionFilter[1]}
                            onChange={(value) => {
                              setTuitionFilter([tuitionFilter[0], value]);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredCollegesForSelection.length} of {colleges.length} colleges
                </p>
                {filteredCollegesForSelection.length > 0 && selectedColleges.length > 0 && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedColleges.length} college{selectedColleges.length !== 1 ? 's' : ''} selected
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearSelectedColleges}
                      className="h-7 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              
              {renderCollegeTable()}
              {renderPagination()}
              
              {selectedColleges.length > 0 && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Selected Colleges:</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearSelectedColleges}
                      className="h-7 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedColleges.map((collegeId) => {
                      const college = colleges.find((c) => c.id === collegeId);
                      if (!college) return null;
                      return (
                        <Badge key={collegeId} variant="outline" className="m-1">
                          {college.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={addSelectedColleges} 
              disabled={selectedColleges.length === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add ${selectedColleges.length} College${selectedColleges.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit College Dialog */}
      <Dialog open={isEditingCollege} onOpenChange={setIsEditingCollege}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit College Information</DialogTitle>
          </DialogHeader>
          
          <FormErrorSummary errors={formErrors} show={formSubmitted} />
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="editStatus">Application Status</RequiredLabel>
              <Select
                value={newUserCollege.application_status}
                onValueChange={(value) => setNewUserCollege({ ...newUserCollege, application_status: value })}
              >
                <SelectTrigger id="editStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Researching">Researching</SelectItem>
                  <SelectItem value="Applying">Applying</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Committed">Committed</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.application_status && <p className="text-xs text-destructive">{formErrors.application_status}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDeadline">Application Deadline (Optional)</Label>
              <Input
                id="editDeadline"
                placeholder="e.g., January 1, 2025"
                value={newUserCollege.application_deadline_display || ""}
                onChange={(e) => setNewUserCollege({ ...newUserCollege, application_deadline_display: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="college-category">College Category</RequiredLabel>
              <div className="grid grid-cols-3 gap-4" id="college-category">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editReach"
                    checked={newUserCollege.is_reach}
                    onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_reach: checked })}
                  />
                  <Label htmlFor="editReach">Reach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editTarget"
                    checked={newUserCollege.is_target}
                    onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_target: checked })}
                  />
                  <Label htmlFor="editTarget">Target</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editSafety"
                    checked={newUserCollege.is_safety}
                    onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_safety: checked })}
                  />
                  <Label htmlFor="editSafety">Safety</Label>
                </div>
              </div>
              {formErrors.category && <p className="text-xs text-destructive">{formErrors.category}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editFavorite"
                checked={newUserCollege.is_favorite}
                onCheckedChange={(checked) => setNewUserCollege({ ...newUserCollege, is_favorite: checked })}
              />
              <Label htmlFor="editFavorite">Add to favorites</Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editNotes">Notes (Optional)</Label>
              <Textarea
                id="editNotes"
                placeholder="Add any notes about this college..."
                value={newUserCollege.notes || ""}
                onChange={(e) => setNewUserCollege({ ...newUserCollege, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateCollege}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={!!confirmDeleteCollege}
        onOpenChange={(open) => !open && setConfirmDeleteCollege(null)}
        title="Remove College"
        description="Are you sure you want to remove this college from your list? This will also delete any college-specific data you've created."
        confirmText="Remove"
        onConfirm={() => confirmDeleteCollege && deleteCollege(confirmDeleteCollege)}
        variant="destructive"
      />
    </div>
  )
}
